import { X, Star, MessageCircle, Shield, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface UserReviewsInfoModalProps {
  onClose: () => void;
}

export function UserReviewsInfoModal({ onClose }: UserReviewsInfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-cyan-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 border-b border-cyan-500/30 px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recenzije korisnika</h2>
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
                <Star className="w-7 h-7 text-cyan-400" />
                <h3 className="text-2xl font-bold text-white">Kako funkcionira sistem recenzija?</h3>
              </div>

              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p className="text-lg">
                  Sistem recenzija omogućava transparentnu razmjenu iskustava između članova zajednice zamjenavozila.ba. Svaki korisnik ima javno vidljiv profil sa prikazom prosječne ocjene i broja recenzija, što pomaže u izgradnji povjerenja i reputacije.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageCircle className="w-6 h-6 text-cyan-400" />
                      <h4 className="text-lg font-bold text-white">Osnova za recenziju</h4>
                    </div>
                    <p className="text-sm text-gray-300">
                      Da biste mogli ostaviti recenziju drugom korisniku, prvo morate razmijeniti najmanje jednu poruku putem internog sistema poruka. Ovo osigurava da su recenzije zasnovane na stvarnoj komunikaciji.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-cyan-400" />
                      <h4 className="text-lg font-bold text-white">Jedna recenzija po korisniku</h4>
                    </div>
                    <p className="text-sm text-gray-300">
                      Možete ostaviti samo jednu recenziju po korisniku. Ovo sprečava višestruke ili spam recenzije i održava integritet sistema ocjenjivanja.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-cyan-400" />
                      <h4 className="text-lg font-bold text-white">Javna vidljivost</h4>
                    </div>
                    <p className="text-sm text-gray-300">
                      Sve recenzije su javno vidljive na profilu korisnika. Prosječna ocjena i broj recenzija prikazani su na profilu i pored imena korisnika u raznim dijelovima platforme.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-cyan-400" />
                      <h4 className="text-lg font-bold text-white">Zaštita integriteta</h4>
                    </div>
                    <p className="text-sm text-gray-300">
                      Lažne ili zlonamjerne recenzije strogo su zabranjene. Korisnici mogu prijaviti neprikladne recenzije, a administratorski tim će ih pregledati i ukloniti po potrebi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Šta recenzija sadrži?</h3>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Ocjena zvjezdicama (1-5)</h4>
                    <p className="text-sm">
                      Korisnici mogu ocijeniti svoje iskustvo sa drugom osobom ocjenom od 1 do 5 zvjezdica. Prosječna ocjena se automatski izračunava i prikazuje na profilu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Tekstualni komentar</h4>
                    <p className="text-sm">
                      Pored ocjene zvjezdicama, korisnici mogu napisati kratak komentar o svom iskustvu. Komentar mora biti konkretan, ispravan i zasnovan na stvarnoj interakciji.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Informacije o recenzentu</h4>
                    <p className="text-sm">
                      Svaka recenzija prikazuje ime korisnika koji ju je ostavio i datum kada je napisana, osiguravajući potpunu transparentnost.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Važna upozorenja</h3>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">Iskrenost i tačnost</h4>
                  <p className="text-sm">
                    Recenzije moraju biti iskrene i zasnovane na stvarnom iskustvu. Lažne informacije ili neprovjerene tvrdnje nisu dozvoljene.
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">Zabrana zlonamjernih recenzija</h4>
                  <p className="text-sm">
                    Recenzije koje imaju za cilj oštećenje reputacije drugog korisnika bez legitimnog razloga, ili koje sadrže uvrede, diskriminaciju ili prijetnje su strogo zabranjene i rezultiraju trajnom zabranom naloga.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-cyan-400 mb-2">Prijavljivanje neprikladnih recenzija</h4>
                  <p className="text-sm">
                    Ako smatrate da je neka recenzija lažna, zlonamjerna ili krši pravila platforme, možete je prijaviti administratorskom timu koji će pregledati situaciju i poduzeti odgovarajuće mjere.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-3">Gradimo zajednicu povjerenja</h3>
              <p className="text-gray-300 mb-4">
                Sistem recenzija je ključan alat za održavanje visoke etike i povjerenja u zajednici zamjenavozila.ba. Vaše iskreno i pošteno ocjenjivanje pomaže drugim korisnicima da donesu informisane odluke.
              </p>
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold">
                <Star className="w-5 h-5 fill-current" />
                <span>Ocijenite pošteno, gradite povjerenje</span>
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
