import LoanApplicationForm from '../components/loan-form/loan-form-config';

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            LendSwift Digital Lending Portal
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Get instant pre-approval for Personal, Home, and Business loans in 8 simple steps.
          </p>
        </div>
        <LoanApplicationForm />
      </div>
    </div>
  );
}

export default App;
