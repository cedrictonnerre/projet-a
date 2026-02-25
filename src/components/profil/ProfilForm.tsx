'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { profilSchema, type ProfilFormData } from '@/lib/validations/profil'
import { sauvegarderProfil } from '@/actions/profil'
import type { Profil } from '@/types/database'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// --- Tâche 4.5 : Type du récapitulatif ---
type Recap = {
  tmb: number
  tdee: number
  objectifKcal: number
}

interface ProfilFormProps {
  profilInitial: Profil | null
}

// --- Tâche 4.2 : Formulaire React Hook Form ---
export function ProfilForm({ profilInitial }: ProfilFormProps) {
  const [recap, setRecap] = useState<Recap | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // --- Tâche 4.3 : Validation Zod côté client (schéma partagé) ---
  const form = useForm<ProfilFormData>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      poids: profilInitial?.poids ?? undefined,
      taille: profilInitial?.taille ?? undefined,
      age: profilInitial?.age ?? undefined,
      sexe: profilInitial?.sexe ?? undefined,
      niveau_activite: profilInitial?.niveau_activite ?? 'tres_actif',
      objectif: profilInitial?.objectif ?? 'prise_muscle',
    },
  })

  const onSubmit = async (data: ProfilFormData) => {
    setErrorMessage(null)
    setRecap(null)

    const result = await sauvegarderProfil(data)

    if (result.success) {
      // --- Tâche 4.5 : Affichage récapitulatif ---
      setRecap(result.data)
    } else {
      setErrorMessage(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Données physiologiques</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Ligne poids / taille */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Poids */}
                <FormField
                  control={form.control}
                  name="poids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poids (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="ex : 80"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))
                          }
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      {/* --- Tâche 4.4 : Messages d'erreur par champ --- */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Taille */}
                <FormField
                  control={form.control}
                  name="taille"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taille (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ex : 180"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))
                          }
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ligne âge / sexe */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Âge */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Âge (ans)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ex : 30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))
                          }
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sexe */}
                <FormField
                  control={form.control}
                  name="sexe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexe</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="homme">Homme</SelectItem>
                          <SelectItem value="femme">Femme</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Niveau d'activité */}
              <FormField
                control={form.control}
                name="niveau_activite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau d&apos;activité physique</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentaire">Sédentaire — peu ou pas d&apos;exercice</SelectItem>
                        <SelectItem value="leger">Léger — 1 à 3 séances/semaine</SelectItem>
                        <SelectItem value="modere">Modéré — 3 à 5 séances/semaine</SelectItem>
                        <SelectItem value="tres_actif">Très actif — 6 à 7 séances/semaine</SelectItem>
                        <SelectItem value="extreme">Extrême — 2× par jour</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Objectif */}
              <FormField
                control={form.control}
                name="objectif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectif nutritionnel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="perte_poids">Perte de poids (−500 kcal/j)</SelectItem>
                        <SelectItem value="maintien">Maintien du poids</SelectItem>
                        <SelectItem value="prise_muscle">Prise de muscle (+250 kcal/j)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message d'erreur global */}
              {errorMessage && (
                <p className="text-sm font-medium text-destructive">{errorMessage}</p>
              )}

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Calculer mes besoins
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- Tâche 4.5 : Récapitulatif après soumission réussie --- */}
      {recap && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Vos besoins caloriques</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  TMB
                </dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">
                  {recap.tmb.toLocaleString('fr-FR')}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kcal</span>
                </dd>
                <p className="mt-1 text-xs text-muted-foreground">Métabolisme de base</p>
              </div>

              <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  TDEE
                </dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">
                  {recap.tdee.toLocaleString('fr-FR')}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kcal</span>
                </dd>
                <p className="mt-1 text-xs text-muted-foreground">Dépense totale/jour</p>
              </div>

              <div className="rounded-lg border bg-primary p-4 text-center shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-primary-foreground/80">
                  Objectif
                </dt>
                <dd className="mt-1 text-2xl font-bold text-primary-foreground">
                  {recap.objectifKcal.toLocaleString('fr-FR')}
                  <span className="ml-1 text-sm font-normal text-primary-foreground/80">kcal</span>
                </dd>
                <p className="mt-1 text-xs text-primary-foreground/80">Apport cible/jour</p>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
