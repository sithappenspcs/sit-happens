import { Button } from "../../components/ui/Button";

export default function BookingEntryPage() {
  return (
    <main className="min-h-screen bg-warm-50 py-24 px-6 md:pt-36 flex items-center justify-center">
      <div className="bg-white max-w-lg w-full p-10 rounded-3xl shadow-md border border-warm-100 text-center space-y-8 animate-fade-in-up">
        <h1 className="font-serif text-4xl font-bold text-sage-800">Book a Service</h1>
        <p className="text-warm-700">
          To check real-time availability and book a service, please log in or create an account.
        </p>
        <div className="flex flex-col gap-4 pt-4">
          <Button variant="primary" className="w-full text-lg py-4">Sign In</Button>
          <Button variant="outline" className="w-full text-lg py-4">Create Account</Button>
        </div>
      </div>
    </main>
  );
}
