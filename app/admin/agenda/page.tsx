import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAppointments } from "@/lib/admin-data/appointments";
import { getClients } from "@/lib/admin-data/clients";
import { getTeamMembers } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { NewAppointmentDialog } from "@/components/admin/new-appointment-dialog";
import { AppointmentStatusSelect } from "@/components/admin/appointment-status-select";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const [appointments, clients, teamMembers] = await Promise.all([
    getAppointments(),
    getClients(),
    getTeamMembers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Agenda</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compromissos confirmados e agendados da equipe.
          </p>
        </div>
        <NewAppointmentDialog
          clients={clients.map((c) => ({ id: c.id, full_name: c.full_name }))}
          teamMembers={teamMembers.map((t) => ({ id: t.id, full_name: t.full_name }))}
        />
      </div>

      <div className="space-y-3">
        {appointments.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum agendamento futuro.
            </CardContent>
          </Card>
        )}
        {appointments.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{a.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(a.start_time)} · {a.team_member_name}
                  </p>
                  {a.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {a.location}
                    </p>
                  )}
                </div>
              </div>
              <AppointmentStatusSelect id={a.id} status={a.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
