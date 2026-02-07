import { X, Shield } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-cyan-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 border-b border-cyan-500/30 px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Uslovi korištenja</h2>
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
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-7 h-7 text-cyan-400" />
                <h3 className="text-2xl font-bold text-white">Opšti uslovi korištenja platforme zamjenavozila.ba</h3>
              </div>

              <div className="space-y-6 text-gray-300 leading-relaxed">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">1. Priroda platforme</h4>
                  <p>
                    zamjenavozila.ba nije prodavac, kupac niti trgovac vozila koja su prikazana na ovoj platformi, niti pružalac usluga koje su oglašene. Naša platforma djeluje isključivo kao posrednik za oglašavanje i povezivanje korisnika koji žele razmijeniti svoja vozila.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">2. Odgovornost korisnika</h4>
                  <p>
                    Vi, kao oglašivač i vlasnik sadržaja, potpuno ste odgovorni za tačnost, potpunost i zakonitost informacija koje objavljujete na svom profilu, u oglasima i u komunikaciji sa drugim korisnicima. Dužni ste pravilno i istinito predstaviti svoje vozilo, tehničko stanje, pravni status, te svoj položaj prema drugim korisnicima platforme.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">3. Izjave oglašivača</h4>
                  <p>
                    Objavljivanjem sadržaja na ovoj platformi dajete izričitu izjavu da posjedujete sva potrebna prava, dozvole i ovlaštenja za raspolaganje vozilom koje oglašavate, te da su sve informacije istinite i ažurne. Snosite punu odgovornost za sadržaj takve izjave prema svim stranama, uključujući druge korisnike platforme i nadležne organe.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">4. Ograničenje odgovornosti platforme</h4>
                  <p>
                    zamjenavozila.ba ne garantuje istinitost, tačnost, potpunost ili pouzdanost bilo kojeg oglasa, opisa vozila ili komunikacije između korisnika. Nismo odgovorni za štetu, gubitke ili nesuglasice koji mogu nastati usled korištenja platforme, neistinitih informacija, skrivenih mana vozila ili neispunjenja dogovora između korisnika.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">5. Poštovanje prava i zakona</h4>
                  <p>
                    Dužni ste koristiti platformu u skladu sa važećim zakonima Bosne i Hercegovine. Zabranjeno je objavljivanje lažnih informacija, krađa identiteta, prevare, uznemiravanja drugih korisnika, kao i bilo koji drugi oblik zloupotrebe platforme koji može naštetiti trećim licima ili ugledu platforme.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">6. Prijave i žalbe</h4>
                  <p>
                    Poštujemo pravo svakog korisnika na prigovor. Međutim, svaka prijava ili žalba mora biti zasnovana na dokazima i legitimnim razlozima. Lažne prijave ili pokušaji ocrnjivanja drugih korisnika bez osnove predstavljaju kršenje ovih uslova i mogu rezultirati trajnom zabranom korištenja platforme, te pravnim posledicama u skladu sa zakonima o kleveti i uznemiravanju.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">7. Pravo platforme</h4>
                  <p>
                    Zadržavamo pravo da uklonimo bilo koji sadržaj, suspendujemo ili trajno ukinemo nalog bilo kojeg korisnika koji krši ove uslove, javni red i mir, ili djeluje na štetu drugih korisnika, bez prethodne najave ili obrazloženja.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">8. Slobodno tržište</h4>
                  <p>
                    Svi korisnici imaju jednako pravo korištenja sadržaja i usluga platforme zamjenavozila.ba. Poštujte načela slobodnog tržišta, fer konkurencije i poslovne etike u svim interakcijama.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-2">9. Prihvatanje uslova</h4>
                  <p>
                    Korištenjem platforme zamjenavozila.ba potvrđujete da ste pročitali, razumjeli i u potpunosti prihvatili ove Uslove korištenja. Ako se ne slažete sa bilo kojim dijelom ovih uslova, molimo da ne koristite našu platformu.
                  </p>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400 italic">
                    Napomena: Ovi uslovi korištenja mogu biti izmjenjeni ili dopunjeni. Za prijedloge, pitanja ili prijavljivanje problema, kontaktirajte našu podršku.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 text-center">
              <p className="text-gray-300 text-lg">
                Hvala vam na razumijevanju i poštovanju ovih uslova korištenja.
              </p>
              <p className="text-cyan-400 font-semibold mt-2">
                zamjenavozila.ba - Transparentno i odgovorno
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
