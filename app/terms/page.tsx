
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | VisionFlow",
  description: "Terms governing access to and use of VisionFlow.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:p-14">
        <Link href="/" className="font-bold text-blue-700">VisionFlow</Link>

        <header className="mt-8 border-b border-slate-200 pb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: October 26, 2026
          </p>
        </header>

        <div className="mt-8 space-y-8 leading-7">
          <section>
            <h2 className="text-xl font-bold">1. Acceptance</h2>
            <p className="mt-3">
              These Terms govern access to and use of VisionFlow, a platform
              intended to support clinic administration, patient communication,
              appointment management, and related workflows. By accessing or
              using the service, you agree to these Terms on behalf of yourself
              or the organization you are authorized to represent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Eligibility and accounts</h2>
            <p className="mt-3">
              Organizations must provide accurate account information and
              ensure that users are authorized to access their accounts.
              Account credentials must be kept confidential. You are
              responsible for activities performed through your account,
              subject to applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Permitted use</h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Use the service unlawfully or infringe another person's rights.</li>
              <li>Attempt unauthorized access to accounts, systems, or data.</li>
              <li>Upload malicious code or interfere with service security or availability.</li>
              <li>Send spam or messages without the necessary permission or lawful basis.</li>
              <li>Misuse patient information or access records beyond your authorization.</li>
              <li>Use WhatsApp integrations in violation of Meta's applicable terms or messaging policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Clinic and patient responsibilities</h2>
            <p className="mt-3">
              Clinics are responsible for the accuracy and lawful use of
              information they submit, their users' access rights, and any
              required notices or permissions for patient communications.
              Clinics must follow applicable privacy, healthcare, recordkeeping,
              and data-protection requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. WhatsApp and third-party services</h2>
            <p className="mt-3">
              WhatsApp functionality depends on Meta's platform, account
              permissions, phone-number status, approved templates where
              required, messaging limits, and other third-party conditions.
              VisionFlow cannot guarantee uninterrupted availability of
              third-party services or delivery of every message.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Healthcare disclaimer</h2>
            <p className="mt-3">
              VisionFlow is a software and administrative support platform.
              Unless expressly stated in a separate written agreement, it does
              not replace professional clinical judgment, medical advice,
              diagnosis, or treatment. Healthcare professionals remain
              responsible for clinical decisions and patient care.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Availability and changes</h2>
            <p className="mt-3">
              We may maintain, update, modify, suspend, or discontinue parts
              of the service where reasonably necessary for security,
              maintenance, legal compliance, or product development. We will
              seek to communicate material changes where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Data and privacy</h2>
            <p className="mt-3">
              Use of personal information is described in our{" "}
              <Link href="/privacy" className="text-blue-700 underline">
                Privacy Policy
              </Link>
              . Clinics remain responsible for information they collect and
              submit and must ensure they are authorized to do so.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">9. Suspension and termination</h2>
            <p className="mt-3">
              Access may be restricted or suspended where reasonably necessary
              to address security risks, unlawful use, violations of these
              Terms, or requirements imposed by law or third-party platforms.
              Where appropriate, the account holder may request account
              closure and applicable data handling through the available
              support process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Disclaimers and liability</h2>
            <p className="mt-3">
              To the extent permitted by law, the service is provided subject
              to its documented features and limitations. Nothing in these
              Terms excludes liability that cannot lawfully be excluded.
              Any additional warranties, liability limits, fees, or service
              commitments must be set out in the applicable customer agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">11. Changes to these Terms</h2>
            <p className="mt-3">
              We may update these Terms from time to time. Continued use after
              an updated version takes effect is subject to the revised Terms,
              to the extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">12. Contact</h2>
            <p className="mt-3">
              Website:{" "}
              <a href="https://www.visionfloww.com" className="text-blue-700 underline">
                www.visionfloww.com
              </a>
              <br />
              Email:{" "}
              <a href="mailto:aloziegodswill70@gmail.com" className="text-blue-700 underline">
                aloziegodswill70@gmail.com
              </a>
            </p>
          </section>
        </div>

        <footer className="mt-12 flex flex-wrap justify-center gap-5 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <Link href="/privacy" className="underline">Privacy Policy</Link>
          <Link href="/terms" className="underline">Terms of Service</Link>
          <Link href="/data-deletion" className="underline">Data Deletion</Link>
        </footer>
      </article>
    </main>
  );
}
