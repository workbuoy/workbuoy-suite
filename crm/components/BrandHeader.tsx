import { Home, Building2, Users, KanbanSquare, Rocket } from 'lucide-react';
import Link from 'next/link';
export default function BrandHeader(){
  return (
    <header className="wb-header">
      <div className="wb-container wb-nav">
        <Link href="/portal/crm" className="wb-logo">
          <span className="wb-logo-icon" />
          <span>Workbuoy</span>
        </Link>
        <nav className="wb-links">
          <Link href="/portal/crm" className="wb-link"><Home size={16} style={{marginRight:6}}/> CRM</Link>
          <Link href="/portal/crm/companies" className="wb-link"><Building2 size={16} style={{marginRight:6}}/> Selskaper</Link>
          <Link href="/portal/crm/contacts" className="wb-link"><Users size={16} style={{marginRight:6}}/> Kontakter</Link>
          <Link href="/portal/crm/deals" className="wb-link"><KanbanSquare size={16} style={{marginRight:6}}/> Pipeline</Link>
          <Link href="/portal/crm/onboarding" className="wb-cta"><Rocket size={16} style={{marginRight:6}}/> Onboarding</Link>
        </nav>
      </div>
    </header>
  );
}
