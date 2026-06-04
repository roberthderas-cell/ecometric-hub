import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export function useOnboardingGuard(user) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    // Don't redirect if already on onboarding
    if (location.pathname === '/onboarding') {
      setChecking(false);
      return;
    }

    const check = async () => {
      try {
        const profiles = await base44.entities.AziendaProfilo.filter({ user_id: user.id });
        const completed = profiles?.some(p => p.onboarding_completato === true);
        if (!completed) {
          navigate('/onboarding', { replace: true });
        }
      } catch (e) {
        // If error, still allow access to avoid blocking users
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [user?.id, location.pathname]);

  return { checking };
}