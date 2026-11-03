import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ to, label, className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goBack = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md font-bold text-on-surface shadow-sm transition-all hover:border-primary hover:bg-surface-container hover:text-primary active:scale-95 ${className}`}
      onClick={goBack}
      type="button"
    >
      <ArrowLeft size={18} strokeWidth={2.5} />
      <span>{label ?? t('back')}</span>
    </button>
  );
};
