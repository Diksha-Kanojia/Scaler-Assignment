import calendarPreview from "./assets/calendarpreview.png";
import googleLogo from "./assets/googlelogo.png";
import { supabase } from "./supabaseClient";

const LandingPage = () => {
  const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    console.error('Error logging in:', error.message);
  }
};

  return (
    <div className="font-sans text-gray-800 bg-white">
      <nav className="flex justify-between items-center px-12 py-4 shadow-sm border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <img src={googleLogo} alt="Google Logo" className="h-6 w-auto" /> 
          <span className="text-gray-700 font-medium text-lg">Workspace</span>

          <div className="hidden md:flex items-center space-x-8 text-gray-600 text-sm -ml-20">
            <a href="#" className="hover:text-gray-800"></a>
            <a href="#" className="hover:text-gray-800">Solutions</a>
            <a href="#" className="hover:text-gray-800">Products</a>
            <a href="#" className="hover:text-gray-800">Industries</a>
            <a href="#" className="hover:text-gray-800">AI</a>
            <a href="#" className="hover:text-gray-800">Pricing</a>
            <a href="#" className="hover:text-gray-800">Resources</a>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-50 text-sm">
            Try Calendar for work
          </button>
          <button 
            onClick={handleGoogleLogin}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 text-sm"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-32 py-20 gap-2">
        <div className="max-w-xl space-y-6 md:w-[45%]">
          <div className="flex items-center space-x-2">
            <img
              src="https://storage.googleapis.com/gweb-workspace-assets/uploads/7uffzv9dk4sn-5sS0jg4waN13DonunGp4O5-4ed7c4785b1425173cf5914e32684fd3-Product_Logo_-_Calendar.svg"
              alt="Google Calendar"
              width="132"
              height="36"
              loading="eager"
            />
          </div>

          <h1 className="text-5xl font-bold leading-tight text-gray-900">
            Shareable <br /> Online Calendar
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed">
            Spend less time planning and more time doing with a shareable
            calendar that works across Google Workspace.
          </p>

          <div className="flex gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Sign in
            </button>
            <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50">
              Try Calendar for work
            </button>
          </div>
        </div>

        <div className="md:w-[80%] flex justify-center">
          <img
            src={calendarPreview}
            alt="Calendar preview"
            className="rounded-lg shadow-lg w-[70%] max-w-[500px] object-contain"
          />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;