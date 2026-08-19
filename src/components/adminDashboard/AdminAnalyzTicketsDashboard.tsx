import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    TrendingUp,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminAnalyzTicketsDashboard() {
    const ticketData = [
        { name: "Lun", aperti: 4, chiusi: 2 },
        { name: "Mar", aperti: 3, chiusi: 5 },
        { name: "Mer", aperti: 6, chiusi: 3 },
        { name: "Gio", aperti: 5, chiusi: 4 },
        { name: "Ven", aperti: 2, chiusi: 7 },
        { name: "Sab", aperti: 1, chiusi: 2 },
        { name: "Dom", aperti: 0, chiusi: 1 },
    ]

    const ticketStatusData = [
        { name: "Aperti", value: 8 },
        { name: "In lavorazione", value: 5 },
        { name: "Chiusi", value: 12 },
    ]

    /* ---------- TOOLTIP MODERNO ---------- */
    const ModernTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover text-popover-foreground border border-border shadow-xl rounded-2xl px-5 py-3 text-sm">
                    <p className="font-bold text-foreground mb-2 text-base">{label}</p>
                    {payload.map((entry: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                            <div
                                className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-background"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground font-medium">{entry.name}:</span>
                            <span className="font-bold text-foreground">{entry.value}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    // Stato per i colori del tema (li leggiamo dal CSS all'avvio)
    const [statusColors, setStatusColors] = useState<string[]>(["#f43f5e", "#f59e0b", "#10b981"])
    const [barApertiColor, setBarApertiColor] = useState("#f43f5e")
    const [barChiusiColor, setBarChiusiColor] = useState("#10b981")

    useEffect(() => {
        // Legge le variabili CSS del tema shadcn
        const root = document.documentElement
        const getVar = (name: string) => getComputedStyle(root).getPropertyValue(name).trim()

        const destructive = getVar("--destructive") || "340, 80%, 50%"
        const warning = getVar("--warning") || "45, 90%, 50%"
        const success = getVar("--success") || "160, 80%, 40%"

        // Recharts accetta stringhe come "hsl(340, 80%, 50%)"
        setStatusColors([`hsl(${destructive})`, `hsl(${warning})`, `hsl(${success})`])
        setBarApertiColor(`hsl(${destructive})`)
        setBarChiusiColor(`hsl(${success})`)
    }, [])

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Analisi ticket
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Monitora l’andamento settimanale e la distribuzione delle richieste
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* BAR CHART */}
                <Card className="relative border border-destructive/20 bg-gradient-to-br from-destructive/5 via-background to-background shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-destructive to-destructive/60" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <BarChart className="h-5 w-5 text-destructive" />
                            Confronto settimanale
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Aperti vs chiusi – ultimi 7 giorni
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={ticketData} barGap={8}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--border))"
                                    opacity={0.4}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 13, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={35}
                                />
                                <Tooltip content={<ModernTooltip />} cursor={{ fill: "hsl(var(--muted)/0.3)" }} />
                                <Bar
                                    dataKey="aperti"
                                    fill={barApertiColor}
                                    name="Aperti"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={44}
                                    fillOpacity={0.9}
                                />
                                <Bar
                                    dataKey="chiusi"
                                    fill={barChiusiColor}
                                    name="Chiusi"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={44}
                                    fillOpacity={0.9}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* PIE CHART – ORA CON COLORI DAL TEMA */}
                <Card className="relative border border-success/20 bg-gradient-to-br from-success/5 via-background to-background shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-success to-success/60" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <PieChart className="h-5 w-5 text-success" />
                            Situazione attuale
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Totale ticket per stato
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={ticketStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={105}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="hsl(var(--background))"
                                    strokeWidth={3}
                                >
                                    {ticketStatusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={statusColors[index % statusColors.length]}
                                            className="drop-shadow-lg transition-all duration-300 hover:opacity-80 hover:scale-105"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<ModernTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex gap-6 mt-4 text-sm font-medium">
                            {ticketStatusData.map((status, idx) => (
                                <div key={status.name} className="flex items-center gap-2.5">
                                    <div
                                        className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-background shadow-sm"
                                        style={{ backgroundColor: statusColors[idx] }}
                                    />
                                    <span className="text-muted-foreground">{status.name}</span>
                                    <span className="font-bold text-foreground">{status.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}