import { useEffect, useState, type ReactNode } from "react";
import {
  Route,
  Switch,
  Link,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Headphones,
  Heart,
  Menu,
  MessageCircle,
  Plus,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { siteContent } from "@/data/siteContent";
import NotFound from "@/pages/not-found";
import ListenerRegistration from "@/pages/ListenerRegistration";
const logo = `${import.meta.env.BASE_URL}talkone_logo.png`;
import "./logo.css";
function setMetaContent(selector: string, content: string) {
  document
    .querySelector<HTMLMetaElement>(selector)
    ?.setAttribute("content", content);
}

// function Logo() {
//   return <span className="brand" aria-label="TalkOne home">
//     <span className="brand-mark" aria-hidden="true">
//       <MessageCircle strokeWidth={2.7} />
//       <Plus size={11} strokeWidth={3} style={{ position: 'absolute', left: 3, top: 5 }} />
//       </span>
//     <span>TalkOne</span>
//   </span>;
// }

function Logo() {
  return (
    <span className="brand" aria-label="TalkOne home">
      <span className="brand-logo-wrapper">
        <img src={logo} alt="TalkOne" className="brand-logo" />

        <span style={{ position: "absolute", left: 180 }}>TalkOne</span>
      </span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  useEffect(() => setOpen(false), [location]);
  return (
    <>
      <div className="announcement">
        <strong>Real people. Real talk.</strong> &nbsp; A little more room to be
        heard.
      </div>
      <header className="header">
        <div className="wrap nav">
          <a href="/" className="logo-link" aria-label="TalkOne home">
            <Logo />
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            {siteContent.nav.map((item) => (
              <a
                key={item.href}
                href={location === "/" ? item.href : `/${item.href}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Link
            href="/listener-registration"
            className="button button-dark button-small nav-cta"
            data-testid="link-listener-registration-nav"
          >
            Become a listener <ArrowRight size={15} />
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen(!open)}
            data-testid="button-mobile-menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {open && (
          <nav
            className="mobile-nav"
            id="mobile-navigation"
            aria-label="Mobile navigation"
          >
            {siteContent.nav.map((item) => (
              <a
                key={item.href}
                href={location === "/" ? item.href : `/${item.href}`}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/listener-registration"
              className="button button-dark"
              data-testid="link-mobile-listener-registration"
            >
              Become a listener <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <a href="/" aria-label="TalkOne home">
              <Logo />
            </a>
            <p className="footer-intro">
              A platform for people looking for conversation, and the listeners
              who make time for it.
            </p>
          </div>
          <div>
            <h2 className="footer-title">Explore</h2>
            <div className="footer-links">
              <a href="/#about">About TalkOne</a>
              <a href="/#how-it-works">How it works</a>
              <a href="/#for-users">For people looking to talk</a>
              <a href="/#faq">Frequently asked questions</a>
            </div>
          </div>
          <div>
            <h2 className="footer-title">Join in</h2>
            <div className="footer-links">
              <a href="/listener-registration">Become a listener</a>
              <a href="/#contact">Get in touch</a>
              <a href="#app-links">
                App Store <span aria-label="placeholder">(coming soon)</span>
              </a>
              <a href="#app-links">
                Google Play <span aria-label="placeholder">(coming soon)</span>
              </a>
            </div>
          </div>
          <div>
            <h2 className="footer-title">Say hello</h2>
            <p className="footer-placeholder">
              {siteContent.placeholders.email}
              <br />
              {siteContent.placeholders.phone}
              <br />
              <br />
              Social links: [placeholders]
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} TalkOne. Company details:
            [placeholder].
          </span>
          <span>
            <span id="privacy">
              Privacy: {siteContent.placeholders.privacy}
            </span>{" "}
            &nbsp;·&nbsp;{" "}
            <span id="terms">Terms: {siteContent.placeholders.terms}</span>
          </span>
        </div>
        <div id="app-links" className="sr-only">
          Official app download links will be added when available.
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function iconFor(key: string) {
  if (key === "message") return <MessageCircle size={23} />;
  if (key === "people") return <Users size={23} />;
  if (key === "heart") return <Heart size={23} />;
  return <Repeat2 size={23} />;
}

function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useEffect(() => {
    document.title = "TalkOne — Someone Is Here to Listen";
    const description =
      "TalkOne connects people looking for someone to talk to with human listeners ready to listen. Real people. Real talk.";
    setMetaContent('meta[name="description"]', description);
    setMetaContent(
      'meta[property="og:title"]',
      "TalkOne — Someone Is Here to Listen",
    );
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent(
      'meta[name="twitter:title"]',
      "TalkOne — Someone Is Here to Listen",
    );
    setMetaContent('meta[name="twitter:description"]', description);
  }, []);
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="hero" id="home">
          <span className="hero-deco">a place to begin</span>
          <div className="wrap hero-grid">
            <div className="reveal">
              <span className="eyebrow">{siteContent.home.eyebrow}</span>
              <h1>{siteContent.home.headline}</h1>
              <p className="hero-copy">{siteContent.home.description}</p>
              <div className="hero-actions">
                <a
                  href="#for-users"
                  className="button button-dark"
                  data-testid="link-find-listener"
                >
                  Find a listener <ArrowRight size={16} />
                </a>
                <Link
                  href="/listener-registration"
                  className="button button-outline"
                  data-testid="link-become-listener-hero"
                >
                  Become a listener
                </Link>
              </div>
              <div className="hero-note">
                <div className="avatars" aria-hidden="true">
                  <span className="avatar">A</span>
                  <span className="avatar">M</span>
                  <span className="avatar">J</span>
                </div>
                <span>A human conversation, whenever you’re ready.</span>
              </div>
            </div>
            <div
              className="hero-art reveal delay-1"
              role="img"
              aria-label="Abstract illustration of two people sharing a thoughtful conversation"
            >
              <div className="art-orbit">
                <div className="art-sun" />
                <div className="art-curve" />
                <div className="art-person" />
                <div className="art-hand" />
              </div>
              <div className="art-card art-card-top">
                <span className="mini-icon">
                  <Headphones size={19} />
                </span>
                <span>
                  <strong>Here to listen</strong>
                  <small>At your own pace</small>
                </span>
              </div>
              <div className="art-card art-quote">
                “It helped to say it out loud.”
                <span>A moment of connection</span>
              </div>
            </div>
          </div>
        </section>
        <div className="trust-strip">
          <div className="wrap trust-inner">
            <span className="trust-label">A thoughtful space for</span>
            <span className="trust-item">
              <Heart size={16} /> Everyday conversation
            </span>
            <span className="trust-item">
              <ShieldCheck size={16} /> Choice and comfort
            </span>
            <span className="trust-item">
              <Users size={16} /> Human connection
            </span>
          </div>
        </div>
        <section className="section" id="about">
          <div className="wrap about-grid">
            <div className="about-stamp">
              <div className="stamp-content">
                <Sparkles size={23} />
                <p>{siteContent.about.note}</p>
              </div>
            </div>
            <div className="about-copy">
              <span className="eyebrow">{siteContent.about.eyebrow}</span>
              <h2>{siteContent.about.title}</h2>
              <p>{siteContent.about.description}</p>
              <a href="#how-it-works" className="text-link">
                A little about how it works <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
        <section className="section section-soft" id="how-it-works">
          <div className="wrap">
            <div className="steps-head">
              <SectionHeading
                eyebrow="Simple by design"
                title="A conversation starts with one small step."
              >
                No script, no pressure. Just a simple way to find a person and
                begin talking.
              </SectionHeading>
              <a className="button button-outline" href="#faq">
                A few common questions <ArrowDown size={15} />
              </a>
            </div>
            <div className="step-list">
              {siteContent.steps.map((step, index) => (
                <article
                  className="step"
                  key={step.title}
                  data-testid={`step-${index + 1}`}
                >
                  <span className="step-number">0{index + 1}</span>
                  <div className="step-icon">{iconFor(step.icon)}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section user-section" id="for-users">
          <div className="wrap user-grid">
            <div>
              <SectionHeading
                eyebrow="For people looking to talk"
                title="Your conversation. Your pace."
              >
                There’s no one right reason to want a conversation. Sometimes
                it’s helpful just to have someone listen.
              </SectionHeading>
              <a href="#contact" className="text-link">
                Wondering if TalkOne is for you? <ArrowRight size={16} />
              </a>
            </div>
            <div className="benefit-list">
              {siteContent.benefits.map((item) => (
                <article className="benefit" key={item.title}>
                  <span className="check">
                    <Check size={16} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="listener-band" id="become-listener">
          <div className="wrap listener-grid">
            <div>
              <span className="eyebrow">For the ones who listen</span>
              <h2>Someone out there may need someone like you.</h2>
              <p>
                Some of the most meaningful things we do begin with being
                present. If you have time, care, and a willingness to listen,
                there may be a place for you at TalkOne.
              </p>
              <Link
                href="/listener-registration"
                className="button button-teal"
                data-testid="link-listener-registration-band"
              >
                Explore becoming a listener <ArrowRight size={16} />
              </Link>
            </div>
            <div className="listener-perks">
              {siteContent.listenerBenefits.map((item) => (
                <p key={item}>
                  <Check size={17} />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>
        <section className="section" id="faq">
          <div className="wrap faq-grid">
            <SectionHeading
              eyebrow="Good to know"
              title="A few things you might be wondering."
            >
              <a className="text-link" href="#contact">
                Still have a question? <ArrowRight size={15} />
              </a>
            </SectionHeading>
            <div className="faq-list">
              {siteContent.faqs.map((item, index) => (
                <article className="faq-item" key={item.q}>
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={openFaq === index}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                      data-testid={`button-faq-${index + 1}`}
                    >
                      {item.q}
                      <Plus size={19} />
                    </button>
                  </h3>
                  {openFaq === index && (
                    <div className="faq-answer" id={`faq-answer-${index}`}>
                      <p>{item.a}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="contact-band" id="contact">
          <div className="wrap contact-inner">
            <div>
              <span className="eyebrow">We’re listening</span>
              <h2>Questions are welcome.</h2>
              <p>
                Contact details will be published here soon:{" "}
                {siteContent.placeholders.email}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/listener-registration" component={ListenerRegistration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
