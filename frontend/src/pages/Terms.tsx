import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import footerbackheight from "../assets/images/footerbackheight.png";
import signin from "../assets/images/terms.jpg";

export default function TermsAndConditionsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 max-w-[1920px] mx-auto relative">
      {/* Left: Terms Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 relative z-10">
          {/* Header */}
          <div className="mb-6 flex items-center gap-2">
            <button
              className="text-2xl font-extrabold text-green-800 cursor-pointer"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <FaArrowLeft className="w-4 text-[#0a1117]" />
            </button>
            <span className="text-2xl font-bold text-[#0a1117]">GovDocLex</span>
          </div>

          <h1 className="text-3xl font-bold text-[#0a1117] mb-3">
            Terms and Conditions
          </h1>
          <p className="text-gray-500 mb-6">Last updated: October 2025</p>

          {/* Content */}
          <div className="space-y-5 text-gray-700 leading-relaxed overflow-y-auto max-h-[70vh] pr-2">
            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">1. Purpose</h2>
              <p>
                GovDocLex is an AI-powered information extraction and retrieval platform 
                designed to help users explore, analyze, and understand Sri Lankan government 
                acts and regulations through natural language queries and document search.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">2. Use of Information</h2>
              <p>
                The content provided on GovDocLex is sourced from publicly available 
                government documents such as Acts and Gazette publications. 
                Generated responses are for informational purposes only and 
                do not constitute legal advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">3. Accuracy of Information</h2>
              <p>
                While we strive to ensure accuracy, we do not guarantee the completeness 
                or correctness of any information retrieved or generated through the platform. 
                Users are advised to verify details with official sources.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">4. User Responsibilities</h2>
              <p>
                You agree to use the platform responsibly, ethically, and in compliance 
                with applicable Sri Lankan laws. Misuse of the system, including attempts 
                to reverse-engineer or distribute harmful content, is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">5. Intellectual Property</h2>
              <p>
                All software, models, and design assets of GovDocLex are protected intellectual 
                property. Public government documents remain under respective government copyrights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">6. Privacy and Data Usage</h2>
              <p>
                We may collect minimal usage data (such as query logs) to improve system 
                performance and accuracy. We do not store personally identifiable information 
                unless voluntarily provided by the user. For more details, please refer to our 
                Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">7. Disclaimer of Liability</h2>
              <p>
                GovDocLex is provided on an "as-is" basis. We are not responsible for any 
                losses, damages, or misinterpretations resulting from use of the information 
                or chatbot responses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">8. Modifications</h2>
              <p>
                We reserve the right to update these Terms at any time. Any updates will 
                be reflected with a new “Last updated” date on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">9. Governing Law</h2>
              <p>
                These Terms shall be governed by and interpreted in accordance with the 
                laws of Sri Lanka. Any disputes shall fall under the exclusive jurisdiction 
                of Sri Lankan courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-1 text-[#0a1117]">10. Contact</h2>
              <p>
                If you have any questions regarding these Terms, please contact us at:{" "}
                <a
                  href="mailto:info@govdoclex.lk"
                  className="text-green-800 hover:underline"
                >
                  info@govdoclex.lk
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Right side: Illustration */}
      <div className="hidden md:flex flex-col flex-1 bg-[#0a1117] text-white justify-center px-12 py-8 relative items-center">
        <div className="rounded-xl p-6 mb-8 max-w-md">
          <img
            src={signin}
            alt="Documents"
            className="w-full h-96 object-cover rounded-xl mb-4"
          />
        </div>
        <div className="text-center max-w-lg">
          <h3 className="text-4xl font-semibold mb-3">
            Transparency. Accessibility. Trust.
          </h3>
          <p className="text-gray-200 text-lg">
            GovDocLex empowers citizens, researchers, and policymakers to explore 
            Sri Lanka’s legal documents with clarity and confidence.
          </p>
        </div>
        <img
          src={footerbackheight}
          alt="Footer Background"
          className="absolute bottom-0 left-0 w-full object-cover opacity-50"
        />
      </div>
    </div>
  );
}
