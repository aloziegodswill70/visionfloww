
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion Instructions | VisionFlow",
  description:
    "Learn how to request deletion of VisionFlow account and personal information.",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:p-14">
        <Link href="/" className="font-bold text-blue-700">VisionFlow</Link>

        <header className="mt-8 border-b border-slate-200 pb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Data Deletion Instructions
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: October 26, 2026
          </p>
        </header>

        <div className="mt-8 space-y-8 leading-7">
          <section>
            <h2 className="text-xl font-bold">Requesting deletion</h2>
            <p className="mt-3">
              VisionFlow users may request deletion of account information and
              personal data associated with their use of the platform. To
              request deletion, email{" "}
              <a
                className="font-semibold text-blue-700 underline"
                href="mailto:aloziegodswill70@gmail.com?subject=VisionFlow%20Data%20Deletion%20Request"
              >
                aloziegodswill70@gmail.com
              </a>{" "}
              with the subject line “VisionFlow Data Deletion Request”.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">What to include</h2>
            <p className="mt-3">
              Include your name, the email address associated with your
              account, your clinic or organization (if applicable), and a
              description of the information you want deleted. Do not email
              passwords, access tokens, or unnecessary medical information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Verification and processing</h2>
            <p className="mt-3">
              We may need to verify your identity or authority before acting
              on a request. If the information belongs to a clinic's patient,
              we may direct the request to the clinic responsible for that
              information or coordinate with its authorized administrator.
              We will assess and process valid requests in accordance with
              applicable law and any legal or recordkeeping obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">What happens next?</h2>
            <p className="mt-3">
              After reviewing the request, we will communicate any necessary
              clarification and the outcome through the contact details
              provided. Some information may need to be retained where
              required or permitted by law, for security, or to resolve
              legitimate disputes.
            </p>
            <p className="mt-3">
              Submitting a request does not itself automatically delete
              information. Deletion is completed after the request has been
              verified, assessed, and processed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">WhatsApp information</h2>
            <p className="mt-3">
              If your information was exchanged through a clinic's WhatsApp
              account, please also contact that clinic. Deleting information
              from VisionFlow does not necessarily delete copies retained in
              WhatsApp, on a sender's device, or in another third-party
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Related policies</h2>
            <p className="mt-3">
              Read our{" "}
              <Link href="/privacy" className="text-blue-700 underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-blue-700 underline">
                Terms of Service
              </Link>{" "}
              for more information about the service.
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
