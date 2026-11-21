import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useTitle } from '../lib/useTitle'

export function NotFoundPage() {
  const { t } = useI18n()
  useTitle(t.notFound.title)
  return (
    <div className="shell" style={{ padding: '96px var(--gutter) 120px', textAlign: 'center' }}>
      <p className="cap" style={{ color: 'var(--text-3)' }}>
        404
      </p>
      <h1 style={{ fontSize: 'clamp(30px, 6vw, 52px)', marginTop: 14, textTransform: 'uppercase', letterSpacing: '.02em' }}>
        {t.notFound.h1}
      </h1>
      <p style={{ color: 'var(--text-2)', margin: '14px auto 28px', maxWidth: 420 }}>{t.notFound.text}</p>
      <Link to="/catalog" className="btn btn-primary">
        {t.notFound.toCatalog}
      </Link>
    </div>
  )
}
