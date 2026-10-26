
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | VisionFlow",
  description:
    "Learn how VisionFlow handles account, clinic, patient, and WhatsApp data.",
};

const updated = "October 26, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:p-14">
        <Link href="/" className="font-bold text-blue-700">
          VisionFlow
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Legal information
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: {updated}
          </p>
        </header>

        <div className="mt-8 space-y-8 leading-7">
          <section>
            <h2 className="text-xl font-bold">1. Introduction</h2>
            <p className="mt-3">
              VisionFlow is a clinic-management and communication platform
              designed to help healthcare providers manage patient
              communication, appointments, reminders, follow-ups, and related
              administrative activities. This policy explains how information
              may be collected, used, stored, and shared when you use our
              website and services.
            </p>
            <p className="mt-3">
              VisionFlow is operated under the VisionFlow brand. The legal
              entity responsible for the service is the entity identified in
              the applicable customer agreement or account documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Information we may process</h2>
            <p className="mt-3">
              Depending on the features used, the information processed may
              include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Clinic name, branch details, business contact information, and settings.</li>
              <li>User names, email addresses, roles, and authentication-related information.</li>
              <li>Patient names, telephone numbers, appointment details, and communication history entered by an authorized clinic.</li>
              <li>WhatsApp message content, delivery statuses, and relevant account identifiers when WhatsApp integration is enabled.</li>
              <li>Technical logs and security or diagnostic information needed to operate and troubleshoot the service.</li>
            </ul>
            <p className="mt-3">
              Healthcare information can be sensitive. Clinics should only
              enter information they are authorized to process and should
              avoid sending unnecessary medical details through messaging
              channels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. How we use information</h2>
            <p className="mt-3">Information may be used to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Provide and maintain the VisionFlow service.</li>
              <li>Manage clinic accounts, users, patients, and appointments.</li>
              <li>Send or receive messages and appointment communications when configured by a clinic.</li>
              <li>Provide customer support and troubleshoot technical issues.</li>
              <li>Protect accounts, detect misuse, and maintain service reliability.</li>
              <li>Meet applicable legal obligations and respond to legitimate requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Clinics and patient information</h2>
            <p className="mt-3">
              Clinics are responsible for ensuring that they have an
              appropriate legal basis and any required permissions to submit
              patient information to VisionFlow and communicate with patients.
              Clinics should provide patients with appropriate privacy
              information and respect applicable consent and messaging rules.
            </p>
            <p className="mt-3">
              A clinic may control the patient information it submits. Patients
              should generally contact the clinic that collected their
              information to exercise rights relating to their clinical
              records. VisionFlow may assist the clinic where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. WhatsApp and third-party services</h2>
            <p className="mt-3">
              If a clinic connects WhatsApp, relevant account information and
              messages may be processed through Meta's WhatsApp Business
              Platform. Meta's processing is also governed by its own terms
              and privacy policies. Delivery and availability may depend on
              Meta's systems, permissions, and messaging policies.
            </p>
            <p className="mt-3">
              VisionFlow may rely on hosting, database, authentication,
              monitoring, and other service providers to operate its features.
              Such providers may process information on behalf of VisionFlow
              under applicable arrangements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Sharing and disclosure</h2>
            <p className="mt-3">
              We do not intend to sell personal information. Information may
              be shared with service providers needed to operate the platform,
              with the relevant clinic and its authorized users, when directed
              by an authorized user, when required by law, or when reasonably
              necessary to protect the service and its users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Security and retention</h2>
            <p className="mt-3">
              We use appropriate technical and organizational measures
              intended to protect information. No internet service can
              guarantee absolute security. Access should be limited to
              authorized users, and clinics should protect their credentials.
            </p>
            <p className="mt-3">
              Information is retained for as long as reasonably necessary for
              service delivery, legitimate operational needs, applicable
              agreements, and legal obligations. Actual retention periods may
              depend on the type of information and the clinic's configuration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Your choices and rights</h2>
            <p className="mt-3">
              Depending on applicable law, individuals may have rights to
              access, correct, object to, or request deletion of their
              personal information. Requests concerning patient records should
              normally be directed to the clinic responsible for those
              records. Account and platform-related requests may be sent to
              the contact below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">9. Children's information</h2>
            <p className="mt-3">
              VisionFlow is a business platform, not a service intended for
              children to create their own accounts. Clinics may manage
              appointments for minors where appropriate and are responsible
              for complying with applicable requirements concerning guardians
              and children's information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Changes to this policy</h2>
            <p className="mt-3">
              We may update this policy as the service or applicable
              requirements change. The updated version will be published on
              this page with a revised date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">11. Contact us</h2>
            <p className="mt-3">
              For privacy questions or requests relating to VisionFlow,
              contact:
            </p>
            <p className="mt-3">
              <strong>VisionFlow</strong>
              <br />
              Website:{" "}
              <a
                className="text-blue-700 underline"
                href="https://www.visionfloww.com"
              >
                www.visionfloww.com
              </a>
              <br />
              Email:{" "}
              <a
                className="text-blue-700 underline"
                href="mailto:aloziegodswill70@gmail.com"
              >
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
