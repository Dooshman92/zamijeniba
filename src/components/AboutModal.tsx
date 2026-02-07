import { X, Car, ArrowRightLeft, Shield, Sparkles, MessageCircle, Zap } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-cyan-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 border-b border-cyan-500/30 px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">O nama</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-cyan-400" />
                <h3 className="text-2xl font-bold text-white">Dobrodošli na zamjenavozila.ba</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                Revolucionarna platforma koja spaja vlasnike vozila širom Bosne i Hercegovine,
                omogućavajući brzu, sigurnu i jednostavnu zamjenu automobila, motocikala, quad vozila,
                jet ski vozila i motornih sanki.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-cyan-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
                  <h4 className="text-xl font-bold text-white">Kako funkcionira platforma?</h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Naša platforma omogućava vlasnicima vozila da direktno komuniciraju i dogovaraju zamjenu
                  bez posrednika. Jednostavno dodajte svoje vozilo, pretraživajte oglase drugih korisnika,
                  i kontaktirajte vlasnike koji vas zanimaju. Proces je brz, transparentan i potpuno besplatan
                  za osnovne funkcije.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h4 className="text-xl font-bold text-white">Sigurnost i povjerenje</h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Sigurnost naših korisnika je prioritet. Svi oglasi prolaze kroz moderaciju, korisnici
                  mogu ocjenjivati jedni druge nakon završene razmjene, a naš tim podrške je dostupan
                  za sve upite i probleme. Sistem recenzija i rejting sistema omogućava da brzo
                  identifikujete pouzdane korisnike.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    Premium funkcionalnosti
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">Uskoro</span>
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Radimo na ekskluzivnim Premium funkcijama koje će vam pružiti dodatne mogućnosti za
                  još uspješniju razmjenu vozila. Premium korisnici će uživati u posebnim pogodnostima
                  koje će olakšati i ubrzati proces pronalaženja savršenog vozila za zamjenu.
                  Ostanite sa nama za još novosti!
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-green-400" />
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    Istaknuti oglasi
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">Uskoro</span>
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Priprema se nova funkcionalnost koja će omogućiti da vaš oglas bude u prvom planu!
                  Istaknuti oglasi će biti prikazani na vrhu liste rezultata i imaće poseban vizuelni
                  identitet koji će privući pažnju potencijalnih kupaca. Idealno rješenje za one koji žele
                  maksimalnu vidljivost svog vozila.
                </p>
              </div>

              <div className="border-l-4 border-cyan-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-6 h-6 text-cyan-400" />
                  <h4 className="text-xl font-bold text-white">Direktna komunikacija</h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Naš ugrađeni sistem poruka omogućava sigurnu komunikaciju između korisnika. Direktno
                  možete kontaktirati vlasnike vozila u dva slučaja: kada korisnik ima javno otkriven
                  broj telefona u svom profilu, ili nakon što prihvate vašu ponudu za zamjenu. Ovaj pristup
                  osigurava privatnost svih korisnika i sprječava neželjene poruke, dok omogućava efikasnu
                  komunikaciju sa zainteresovanim stranama.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Zašto izabrati zamjenavozila.ba?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                  <span>Najveća baza vozila za zamjenu u Bosni i Hercegovini</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                  <span>Direktna komunikacija bez posrednika</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                  <span>Siguran i transparentan proces razmjene</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                  <span>Dostupna mobilna i desktop verzija</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                  <span>Brza i profesionalna korisnička podrška</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                  <span>Redovne ažurnosti i nove funkcionalnosti</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 text-center">
              <p className="text-gray-300 text-lg mb-4">
                Pridružite se hiljadama zadovoljnih korisnika koji su već pronašli savršenu zamjenu!
              </p>
              <p className="text-cyan-400 font-semibold">
                zamjenavozila.ba - Jednostavna zamjena vozila, složenih procedura bez!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
