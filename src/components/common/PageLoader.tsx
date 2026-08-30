import { Spinner } from "@/components/ui/spinner";

export function PageLoader() {
    return (
        <div className="flex min-h-svh items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Spinner className="size-6 text-primary" />

                <div className="text-center">
                    <h2 className="text-lg font-semibold">
                        Stiamo caricando il tuo account...
                    </h2>
                </div>
            </div>
        </div>
    );
}