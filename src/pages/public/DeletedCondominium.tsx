import { AlertCircle, Building2 } from "lucide-react";

export default function DeletedCondominium() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-full p-4 mb-6">
                        <Building2 className="h-16 w-16 text-red-500 dark:text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Condominio eliminato</h1>
                    <p className="text-muted-foreground max-w-md text-lg">
                        Il condominio a cui eri associato è stato eliminato dall'amministratore.
                    </p>
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg max-w-md">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                Contatta il tuo amministratore per maggiori informazioni.
                            </p>
                        </div>
                    </div>
                </div>
    )
}