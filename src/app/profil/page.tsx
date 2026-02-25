import { lireProfil } from '@/actions/profil'
import { ProfilForm } from '@/components/profil/ProfilForm'

export const metadata = {
  title: 'Mon Profil — Dashboard Nutrition & Sport',
}

export default async function ProfilPage() {
  const profil = await lireProfil()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Mon profil physiologique</h1>
          <p className="text-muted-foreground mt-1">
            Renseignez vos données pour calculer votre objectif calorique journalier.
          </p>
        </div>
        <ProfilForm profilInitial={profil} />
      </div>
    </main>
  )
}
