import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 19, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>Shrink &amp; Send ("we," "our," or "us") operates the Shrink &amp; Send website and service. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p><strong>Files you upload:</strong> We temporarily process files you upload for compression purposes. Files are processed in your browser and are not stored on our servers unless you choose to send them via email, in which case they are transmitted and then immediately discarded.</p>
            <p><strong>Email addresses:</strong> If you use the email delivery feature, we collect sender and recipient email addresses solely for the purpose of delivering your files.</p>
            <p><strong>Payment information:</strong> If you purchase a subscription, payment processing is handled by Stripe. We do not store your credit card details. We may store your email address and subscription status.</p>
            <p><strong>Usage data:</strong> We may collect basic analytics such as page views and feature usage to improve our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain our file compression and delivery service</li>
              <li>To process transactions and manage subscriptions</li>
              <li>To send your compressed files to designated recipients</li>
              <li>To communicate with you about your account or service updates</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Data Retention</h2>
            <p>Files uploaded for compression are processed in real-time and are not retained after delivery. Email addresses associated with file delivery are not stored beyond the transmission. Subscription and account data is retained as long as your account is active.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
            <p>We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Third-Party Services</h2>
            <p>We use third-party services including Stripe for payment processing. These services have their own privacy policies governing how they handle your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Children's Privacy</h2>
            <p>Our service is not intended for children under 13. We do not knowingly collect information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information by contacting us. Louisiana residents may have additional rights under applicable state law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us at:</p>
            <p><a href="mailto:customer.service@shrinkandsend.com" className="text-electric-600 hover:underline">customer.service@shrinkandsend.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
