import { useState, useCallback, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight, Target as TargetIcon, ClipboardList, ListChecks, History, FlaskConical, FileSpreadsheet, Map } from 'lucide-react';
import TargetSetter from '@/components/report/TargetSetter';
import ExcelImportModal from '@/components/report/ExcelImportModal';
import EsgWizard from '@/components/report/EsgWizard';
import CompletionChecklist from '@/components/report/CompletionChecklist';
import HistoryPanel from '@/components/report/HistoryPanel';
import AnomalyDetector from '@/components/report/AnomalyDetector';
import KpiAlertsPanel from '@/components/report/KpiAlertsPanel';
import { getAllAlerts } from '@/lib/kpiAlerts';
import ReportSidebar from '@/components/report/ReportSidebar';
import LiveEsgBadge from '@/components/report/LiveEsgBadge';
import SectionProgress from '@/components/report/SectionProgress';
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
import { SectionB3, SectionB4, SectionB5, SectionB6, SectionB7, SectionB8, SectionB9, SectionB10, SectionB11 } from '@/components/sections/SectionModuloBase';
import { SectionC1, SectionC2, SectionC3, SectionC4, SectionC5, SectionC6, SectionC7, SectionC8, SectionC9 } from '@/components/sections/SectionModuloCompleto';
import SectionDashboard from '@/components/sections/SectionDashboard';
import SectionObiettivi from '@/components/sections/SectionObiettivi';
import EsgRecommendationsPanel from '@/components/report/EsgRecommendationsPanel';
import { getSectionCompletion, SECTIONS, DEFAULT_DATA, calcESGScore } from '@/lib/vsmeDefaults';
import EsgMilestone from '@/components/report/EsgMilestone';

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
  b3: SectionB3,
  b4: SectionB4,
  b5: SectionB5,
  b6: SectionB6,
  b7: SectionB7,
  b8: SectionB8,
  b9: SectionB9,
  b10: SectionB10,
  b11: SectionB11,
  c1: SectionC1,
  c2: SectionC2,
  c3: SectionC3,
  c4: SectionC4,
  c5: SectionC5,
  c6: SectionC6,
  c7: SectionC7,
  c8: SectionC8,
  c9: SectionC9,
  obiettivi: SectionObiettivi,
  dash: SectionDashboard,
  consigli: EsgRecommendationsPanel,
};

export default function ReportEditor() {
  const { reportId, section } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saveTimer = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTargetSetter, setShowTargetSetter] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  useOnboardingGuard(user);

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

  const [localData, setLocalData] = useState(null);
  const localDataRef = useRef(null);

  useEffect(() => {
    if (report?.data && !localDataRef.current) {
      const d = JSON.parse(JSON.stringify(report.data));
      localDataRef.current = d;
      setLocalData(d);
    }
  }, [report?.data]);

  const reportData = localData || report?.data || JSON.parse(JSON.stringify(DEFAULT_DATA));
  const activeSection = section || 'ana';

  const calcCompletion = useCallback((data) => {
    const secs = ['ana', 'en', 'ac', 'ri', 'pe', 'gov'];
    const total = secs.reduce((s, id) => s + getSectionCompletion(data, id).pct, 0);
    return Math.round(total / secs.length);
  }, []);

  const handleUpdate = useCallback((sectionId, field, value) => {
    const base = localDataRef.current || JSON.parse(JSON.stringify(DEFAULT_DATA));
    const newData = JSON.parse(JSON.stringify(base));
    if (!newData[sectionId]) newData[sectionId] = {};
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!newData[sectionId][parent]) newData[sectionId][parent] = {};
      newData[sectionId][parent][child] = value;
    } else {
      newData[sectionId][field] = value;
    }
    localDataRef.current = newData;
    setLocalData(newData);
    // Debounced save + live ESG score recalc
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(() => {
      const esg_score = calcESGScore(newData);
      const completion = calcCompletion(newData);
      const module = newData?.ana?.modulo === 'comprehensive' ? 'comprehensive' : 'basic';
      updateMutation.mutate({ data: newData, completion, esg_score, module });
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
          data_snapshot: JSON.parse(JSON.stringify(newData)),
        });
      }
    }, 1200);
  }, [updateMutation, calcCompletion, reportId]);

  const handleBulkUpdate = useCallback((sectionId, updates) => {
    const base = localDataRef.current || JSON.parse(JSON.stringify(DEFAULT_DATA));
    const newData = JSON.parse(JSON.stringify(base));
    if (!newData[sectionId]) newData[sectionId] = {};
    Object.assign(newData[sectionId], updates);
    localDataRef.current = newData;
    setLocalData(newData);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(() => {
      const esg_score = calcESGScore(newData);
      updateMutation.mutate({ data: newData, completion: calcCompletion(newData), esg_score });
    }, 800);
  }, [updateMutation, calcCompletion]);

  const handleNavigate = (secId) => navigate(`/report/${reportId}/${secId}`);

  const handleSectionStatusChange = useCallback((sectionId, value) => {
    const base = localDataRef.current || JSON.parse(JSON.stringify(DEFAULT_DATA));
    const newData = JSON.parse(JSON.stringify(base));
    if (!newData.sectionStatus) newData.sectionStatus = {};
    if (value === null) {
      delete newData.sectionStatus[sectionId];
    } else {
      newData.sectionStatus[sectionId] = value;
    }
    localDataRef.current = newData;
    setLocalData(newData);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(() => {
      const esg_score = calcESGScore(newData);
      updateMutation.mutate({ data: newData, completion: calcCompletion(newData), esg_score });
    }, 800);
  }, [updateMutation, calcCompletion]);

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
        onSectionStatusChange={handleSectionStatusChange}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border px-4 py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors shrink-0"><Home className="w-4 h-4" /></Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
              <span className="font-heading font-bold text-primary truncate max-w-[140px] md:max-w-[220px]">{report.name}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0 hidden sm:block" />
              <span className="text-muted-foreground text-xs hidden sm:block">{currentSec?.icon} {currentSec?.label}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-medium transition-all ${isSaving ? 'text-amber-500' : 'text-green-600'}`}>
                {isSaving ? '⏳ Salvataggio...' : '✅ Salvato'}
              </span>
              <KpiAlertsPanel
                alerts={getAllAlerts(reportData, calcESGScore(reportData))}
                onNavigate={handleNavigate}
              />
              <LiveEsgBadge esg={report.esg_score ? { ...report.esg_score } : null} compact />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('biod')}
                className="gap-1 hidden md:flex text-muted-foreground hover:text-foreground"
              >
                <Map className="w-3 h-3" />
                Mappa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExcelImport(true)}
                className="gap-1 hidden md:flex text-muted-foreground hover:text-foreground"
              >
                <FileSpreadsheet className="w-3 h-3" />
                Importa Excel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnomalies(true)}
                className="gap-1 hidden md:flex text-muted-foreground hover:text-foreground"
              >
                <FlaskConical className="w-3 h-3" />
                Anomalie
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="gap-1 hidden md:flex text-muted-foreground hover:text-foreground"
              >
                <History className="w-3 h-3" />
                Storico
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChecklist(true)}
                className="gap-1 hidden md:flex text-muted-foreground hover:text-foreground"
              >
                <ListChecks className="w-3 h-3" />
                Completa report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWizard(true)}
                className="gap-1 hidden md:flex"
              >
                <ClipboardList className="w-3 h-3" />
                Guida
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTargetSetter(true)}
                className="gap-1 hidden sm:flex"
              >
                <TargetIcon className="w-3 h-3" />
                Obiettivi {report.year}
              </Button>
            </div>
          </div>
          {/* Section progress stepper */}
          <SectionProgress data={reportData} activeSection={activeSection} onNavigate={handleNavigate} />
        </header>

        <EsgMilestone score={report.esg_score?.tot ?? 0} />

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl overflow-y-auto">
          {SectionComponent ? (
            <SectionComponent
              data={reportData}
              onUpdate={handleUpdate}
              onBulkUpdate={handleBulkUpdate}
              onNavigate={handleNavigate}
              reportId={reportId}
              report={report}
              {...(activeSection === 'consigli' ? { report } : {})}
            />
          ) : (
            <p className="text-muted-foreground">Sezione non trovata</p>
          )}
        </main>
      </div>

      {showExcelImport && (
        <ExcelImportModal
          currentData={reportData}
          onImport={(mergedData) => {
            localDataRef.current = mergedData;
            setLocalData(mergedData);
            const esg_score = calcESGScore(mergedData);
            const completion = calcCompletion(mergedData);
            updateMutation.mutate({ data: mergedData, completion, esg_score });
            toast.success('Dati Excel importati con successo!');
          }}
          onClose={() => setShowExcelImport(false)}
        />
      )}

      {showAnomalies && (
        <AnomalyDetector
          reportId={reportId}
          currentData={reportData}
          onClose={() => setShowAnomalies(false)}
          onNavigate={handleNavigate}
        />
      )}

      {showHistory && (
        <HistoryPanel
          reportId={reportId}
          currentData={reportData}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showChecklist && (
        <CompletionChecklist
          data={reportData}
          onNavigate={handleNavigate}
          onClose={() => setShowChecklist(false)}
        />
      )}

      {showWizard && (
        <EsgWizard
          data={reportData}
          onUpdate={handleUpdate}
          onClose={() => setShowWizard(false)}
        />
      )}

      {showTargetSetter && (
        <TargetSetter
          report={report}
          onSave={(newData) => {
            updateMutation.mutate({ data: newData });
            setShowTargetSetter(false);
            toast.success('Obiettivi salvati con successo!');
          }}
          onClose={() => setShowTargetSetter(false)}
        />
      )}
    </div>
  );
}