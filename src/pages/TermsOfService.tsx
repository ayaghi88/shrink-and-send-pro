import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 19, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using Shrink &amp; Send ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>Shrink &amp; Send provides file compression and optional email delivery services. We allow users to compress files and download them locally or send them to recipients via email.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are solely responsible for the content of files you upload, compress, and send</li>
              <li>You must not use the Service to transmit illegal, harmful, or infringing content</li>
              <li>You must not attempt to disrupt, overload, or interfere with the Service</li>
              <li>You must have the right to share any files you send via the email delivery feature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Subscriptions and Payments</h2>
            <p>Certain features may require a paid subscription. By purchasing a subscription, you agree to pay the applicable fees. Payments are processed securely through Stripe.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. No Refunds</h2>
            <p><strong>All sales are final. We do not offer refunds for any reason, including but not limited to partial use of a subscription period, dissatisfaction with the Service, or accidental purchases.</strong> By completing a purchase, you acknowledge and agree to this no-refund policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
            <p>All content, branding, and technology associated with Shrink &amp; Send are owned by us or our licensors. You retain ownership of any files you upload. We claim no ownership over your content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that compressed files will meet your specific requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Shrink &amp; Send and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, profits, or business opportunities arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for any reason, including violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Louisiana, United States. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts located in East Baton Rouge Parish, Louisiana.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Changes to Terms</h2>
            <p>We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Contact Us</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p><a href="mailto:customer.service@shrinkandsend.com" className="text-electric-600 hover:underline">customer.service@shrinkandsend.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
