describe('smart-stepper-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display LendSwift Digital Lending Portal heading', () => {
    cy.contains('LendSwift Digital Lending Portal').should('be.visible');
  });
});
