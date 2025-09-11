describe('Navi MVP smoke', () => {
  it('Slider 0 denies writes (WhyDrawer visible)', () => {
    cy.visit('/');
    cy.contains('Autonomy').should('exist');
    cy.get('input[type="range"]').invoke('val', 0).trigger('input');
    cy.contains('Tasks').parent().find('input[placeholder="Title"]').type('Nope');
    cy.contains('Tasks').parent().contains('Add').click();
    cy.contains(/Why\?/i).should('exist'); // drawer visible
  });

  it('Slider 2 allows writes', () => {
    cy.visit('/');
    cy.get('input[type="range"]').invoke('val', 2).trigger('input');
    cy.contains('Tasks').parent().find('input[placeholder="Title"]').type('OK');
    cy.contains('Tasks').parent().contains('Add').click();
    cy.contains('OK').should('exist');
  });
});
