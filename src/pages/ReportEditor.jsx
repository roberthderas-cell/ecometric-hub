import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Save, ChevronRight } from 'lucide-react';
import ReportSidebar from '@/components/report/ReportSidebar';
import SectionAnagrafica from '@/components/sections/SectionAnagrafica';
import SectionEnergia from '@/components/sections/SectionEnergia';
import SectionAcqua from '@/components/sections/SectionAcqua';
import SectionRifiuti from '@/components/sections/SectionRifiuti';
import SectionInquinamento from '@/components/sections/SectionInquinamento';
import SectionBiodiversita from '@/components/sections/SectionBiodiversita';
import SectionPersonale from '@/components/sections/SectionPersonale';
import SectionGovernance from '@/components/sections/SectionGovernance';
import SectionB1 from '@/components/sections/SectionB1';
import SectionB2 from '@/components/sections/SectionB2';
import { SectionC1, SectionC2, SectionC3, SectionC4, SectionC5, SectionC6, SectionC7, SectionC8, SectionC9 } from '@/components/sections/SectionModuloCompleto';
import SectionDashboard from '@/components/sections/SectionDashboard';
import { getSectionCompletion, SECTIONS, DEFAULT_DATA, calcESGScore } from '@/lib/vsmeDefaults';

const ESG_SNAPSHOT_MIN_DELTA = 2; // salva snapshot solo se il totale cambia di almeno 2 punti
let lastSnapshotScore = null;
import { toast } from 'sonner';

const SECTION_COMPONENTS = {
  ana: SectionAnagrafica,
  en: SectionEnergia,
  ac: SectionAcqua,
  ri: SectionRifiuti,
  inq: SectionInquinamento,
  biod: SectionBiodiversita,
  pe: SectionPersonale,
  gov: SectionGovernance,
  b1: SectionB1,
  b2: SectionB2,
  c1: SectionC1,
  c2: SectionC2,
  c3: SectionC3,
  c4: SectionC4,
  c5: SectionC5,
  c6: SectionC6,
  c7: SectionC7,
  c8: SectionC8,
  c9: SectionC9,
  dash: SectionDashboard,
};

export default function ReportEditor() {
  const { reportId, section } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saveTimer = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => base44.entities.Report.filter({ id: reportId }),
    select: (d) => d?.[0],
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => base44.entities.Report.update(reportId, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['report', reportId] }); setIsSaving(false); },
    onError: () => setIsSaving(false),
  });

  const reportData = report?.data || JSON.parse(JSON.stringify(DEFAULT_DATA));
  const activeSection = section || 'ana';

  const calcCompletion = useCallback((data) => {
    const secs = ['ana', 'en', 'ac', 'ri', 'pe', 'gov'];
    const total = secs.reduce((s, id) => s + getSectionCompletion(data, id).pct, 0);
    return Math.round(total / secs.length);
  }, []);

  const handleUpdate = useCallback((sectionId, field, value) => {
    const newData = JSON.parse(JSON.stringify(reportData));
    if (!newData[sectionId]) newData[sectionId] = {};
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!newData[sectionId][parent]) newData[sectionId][parent] = {};
      newData[sectionId][parent][child] = value;
    } else {
      newData[sectionId][field] = value;
    }
    // Debounced save + live ESG score recalc
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(() => {
      const esg_score = calcESGScore(newData);
      const completion = calcCompletion(newData);
      updateMutation.mutate({ data: newData, completion, esg_score });
      // Save ESG snapshot if score changed significantly
      const tot = esg_score.tot;
      if (lastSnapshotScore === null || Math.abs(tot - lastSnapshotScore) >= ESG_SNAPSHOT_MIN_DELTA) {
        lastSnapshotScore = tot;
        base44.entities.EsgSnapshot.create({
          report_id: reportId,
          esg_tot: tot,
          esg_e: esg_score.E,
          esg_s: esg_score.S,
          esg_g: esg_score.G,
          rating: esg_score.rating,
          completion,
        });
      }
    }, 1200);
  }, [reportData, updateMutation, calcCompletion, reportId]);

  const handleBulkUpdate = useCallback((sectionId, updates) => {
    const newData = JSON.parse(JSON.stringify(reportData));
    if (!newData[sectionId]) newData[sectionId] = {};
    Object.assign(newData[sectionId], updates);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(() => {
      const esg_score = calcESGScore(newData);
      updateMutation.mutate({ data: newData, completion: calcCompletion(newData), esg_score });
    }, 800);
  }, [reportData, updateMutation, calcCompletion]);

  const handleNavigate = (secId) => navigate(`/report/${reportId}/${secId}`);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Report non trovato</p>
        <Link to="/"><Button variant="outline">Torna alla home</Button></Link>
      </div>
    );
  }

  const SectionComponent = SECTION_COMPONENTS[activeSection];
  const completion = report.completion || 0;
  const currentSec = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="flex min-h-screen bg-background">
      <ReportSidebar
        data={reportData}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        completion={completion}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors"><Home className="w-4 h-4" /></Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="font-heading font-bold text-primary truncate max-w-[200px]">{report.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-muted-foreground">{currentSec?.icon} {currentSec?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {isSaving ? '⏳ Salvataggio...' : '✅ Salvato'}
            </span>
            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
              {report.name}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl overflow-y-auto">
          {SectionComponent ? (
            <SectionComponent
              data={reportData}
              onUpdate={handleUpdate}
              onBulkUpdate={handleBulkUpdate}
              onNavigate={handleNavigate}
              reportId={reportId}
            />
          ) : (
            <p className="text-muted-foreground">Sezione non trovata</p>
          )}
        </main>
      </div>
    </div>
  );
}