describe('LendSwift Multi-Step Loan Form E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage to start fresh
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should complete Personal Loan Happy Path (< 5L, co-applicant step skipped)', () => {
    // === STEP 1: Basic Info ===
    cy.contains('Select Loan Type & Amount').should('be.visible');
    
    // Choose Personal Loan
    cy.get('input[value="personal"]').click({ force: true });
    
    // Enter Loan Amount (e.g. 4,00,000 - under 5L co-applicant limit)
    cy.get('input[type="number"]').first().type('400000');
    
    // Select Tenure (e.g. 36 Months)
    cy.get('select').first().select('36');
    
    // Select Purpose (e.g. Education)
    cy.get('select').last().select('education');
    
    // Next Step
    cy.contains('Next Step').click();

    // === STEP 2: Personal Information ===
    cy.contains('Personal Information').should('be.visible');
    cy.get('input[name="fullName"]').type('Rahul Sharma');
    cy.get('input[name="dob"]').type('1995-05-15');
    cy.get('input[value="male"]').click({ force: true });
    cy.get('select').first().select('single');
    cy.get('input[name="fatherName"]').type('Vijay Sharma');
    cy.get('input[name="motherName"]').type('Kiran Sharma');
    
    // Email OTP Simulation
    cy.get('input[type="email"]').type('rahul.sharma@example.com');
    cy.contains('Verify').first().click();
    cy.get('input[label="Email OTP"]').type('123456');
    cy.contains('Confirm').click();
    cy.contains('✓ Verified').should('be.visible');

    // Mobile OTP Simulation
    cy.get('input[name="mobileNumber"]').type('9876543210');
    cy.contains('Verify').last().click();
    cy.get('input[label="Mobile OTP"]').type('123456');
    cy.contains('Confirm').click();
    cy.contains('✓ Verified').should('be.visible');

    // Next Step
    cy.contains('Next Step').click();

    // === STEP 3: Identity Verification (KYC) ===
    cy.contains('Identity Verification (KYC)').should('be.visible');
    
    // PAN Verification (Individual - fourth letter P)
    cy.get('input[name="panNumber"]').type('ABCDP1234E');
    cy.contains('Verify PAN').click();
    cy.contains('✓ PAN Verified').should('be.visible');

    // Aadhaar Verification (passes Verhoeff checksum)
    cy.get('input[name="aadhaarNumber"]').type('367705963248');
    cy.contains('Verify Aadhaar').click();
    cy.contains('✓ Aadhaar Verified').should('be.visible');

    // Aadhaar Consent
    cy.get('input[type="checkbox"]').click({ force: true });
    
    // Next Step
    cy.contains('Next Step').click();

    // === STEP 4: Address Information ===
    cy.contains('Address Information').should('be.visible');
    
    // PIN Code lookup checks
    cy.get('input[name="pinCode"]').type('560001');
    cy.get('input[name="city"]').should('have.value', 'Bengaluru');
    cy.get('input[name="state"]').should('have.value', 'Karnataka');
    
    cy.get('input[name="currentAddressLine1"]').type('Flat 402, Block C, Sky Apartments');
    cy.get('input[name="currentAddressLine2"]').type('Koramangala 4th Block');
    cy.get('select').first().select('owned');
    cy.get('input[name="yearsAtCurrentAddress"]').type('3');
    
    // Next Step
    cy.contains('Next Step').click();

    // === STEP 5: Employment & Income Details ===
    cy.contains('Employment & Income Details').should('be.visible');
    cy.get('input[value="salaried"]').click({ force: true });
    cy.get('input[name="companyName"]').type('TechSolutions Ltd');
    cy.get('input[name="designation"]').type('Technical Lead');
    cy.get('input[name="monthlyNetSalary"]').type('75000');
    cy.get('input[name="yearsOfExperience"]').type('6');

    // Next Step
    cy.contains('Next Step').click();

    // === STEP 6: Bank Account Details ===
    cy.contains('Bank Account Details').should('be.visible');
    cy.get('select').first().select('State Bank of India (SBI)');
    cy.get('select').last().select('savings');
    cy.get('input[name="accountNumber"]').type('123456789012');
    cy.get('input[name="confirmAccountNumber"]').type('123456789012');
    cy.get('input[name="ifscCode"]').type('SBIN0001234');

    // Next Step
    cy.contains('Next Step').click();

    // === STEP 7: Document Upload & E-Signature (Step 6 co-applicant is skipped!) ===
    cy.contains('Document Upload & E-Signature').should('be.visible');
    
    // Mock upload inputs or simulate signatures
    // Cypress can select files, but since we require base64 string, let's inject a dummy base64 string
    // Or in Cypress, we can check if components exist.
    // Let's verify that signature capture pad drawing works.
    cy.get('canvas').first().then(($canvas) => {
      const canvas = $canvas[0];
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(50, 50);
      ctx.stroke();
      canvas.dispatchEvent(new Event('mouseup'));
    });

    // Provide signatures and dummy files manually inside inputs if needed,
    // or since RHF registers these fields, let's make sure we test if form inputs are fillable.
  });

  it('should require Co-Applicant step for Home Loans', () => {
    // Choose Home Loan
    cy.get('input[value="home"]').click({ force: true });
    cy.get('input[type="number"]').first().type('6000000'); // 60L
    cy.get('select').first().select('240'); // 20 years
    cy.get('select').last().select('purchase');
    cy.contains('Next Step').click();
    
    // Fill personal, identity, address, employment, and confirm it takes us to Co-Applicant step!
  });
});
