import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A2E]">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#2D6A4F] hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Zur&uuml;ck zur Startseite
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-10">Impressum</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            Angaben gem&auml;&szlig; &sect; 5 TMG
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Christoph Lengowski
            <br />
            Adreystra&szlig;e 116
            <br />
            44225 Dortmund
            <br />
            Deutschland
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            <strong>Vertreten durch:</strong>
            <br />
            Christoph Lengowski
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            <strong>Handelsregister:</strong> Keine Eintragung
            <br />
            <strong>Registergericht:</strong> Entf&auml;llt
            <br />
            <strong>Umsatzsteuer:</strong> Gem&auml;&szlig; &sect; 19 UStG wird keine Umsatzsteuer ausgewiesen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>E-Mail:</strong> c.lengowski@yahoo.de
            <br />
            <strong>Telefon:</strong> 015111851677
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            Verantwortlich f&uuml;r den Inhalt nach &sect; 55 Abs. 2 MStV
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Christoph Lengowski
            <br />
            Adreystra&szlig;e 116
            <br />
            44225 Dortmund
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">EU-Streitschlichtung</h2>
          <p className="text-gray-700 leading-relaxed">
            Die Europ&auml;ische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2D6A4F] hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6 text-sm text-gray-600">
          <Link href="/datenschutz" className="hover:text-[#2D6A4F] transition-colors">
            Datenschutzerkl&auml;rung
          </Link>
          <Link href="/agb" className="hover:text-[#2D6A4F] transition-colors">
            AGB
          </Link>
        </div>
      </div>
    </div>
  );
}
