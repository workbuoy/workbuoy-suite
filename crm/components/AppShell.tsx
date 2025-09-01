import BrandHeader from './BrandHeader';
export default function AppShell({ title, subtitle, children }: any){
  return (
    <div>
      <BrandHeader />
      <section className="wb-hero">
        <div className="wb-container" style={{ padding: '2rem 0' }}>
          <h1 className="wb-title">{title}</h1>
          {subtitle && <p className="wb-sub">{subtitle}</p>}
        </div>
      </section>
      <main className="wb-container wb-page">{children}</main>
    </div>
  );
}
