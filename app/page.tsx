import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Comprehensive Carbon Accounting Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Track, measure, report, and reduce Scope 1-3 emissions with
                enterprise-grade accuracy. Ensure compliance with standards like
                PCAF, ISSB, ISO 14064, GHG Protocol, and SOC 2 Type II.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/demo"
                  className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  Scope 1-3 Tracking
                </h3>
                <p className="text-gray-600">
                  Comprehensive tracking of all emission scopes from direct
                  operations to supply chain.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
                <p className="text-gray-600">
                  Built-in compliance with major standards including GHG
                  Protocol, ISO 14064, and more.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  Advanced Reporting
                </h3>
                <p className="text-gray-600">
                  Generate detailed reports and visualizations for stakeholders
                  and regulators.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Enterprise Grade</h3>
                <p className="text-gray-600">
                  Designed for SMEs, corporates, and financial institutions.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600">
                  SOC 2 Type II certified with bank-level security standards.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
                <p className="text-gray-600">
                  Connect with your existing systems and data sources
                  seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join leading organizations in their sustainability journey.
            </p>
            <Link
              href="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Your Free Trial
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
