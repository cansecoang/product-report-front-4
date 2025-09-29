"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, Clock, Calendar, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CheckinTask {
  task_id: number;
  task_name: string;
  product_name: string;
  checkin_date: string;
  country_name: string;
  organization_name: string;
  status_name: string;
  days_until_checkin: number;
  urgency_level: 'today' | 'tomorrow' | 'this_week' | 'later';
}

interface CheckinData {
  totalUpcoming: number;
  urgentCount: number;
  checkins: {
    today: CheckinTask[];
    tomorrow: CheckinTask[];
    this_week: CheckinTask[];
    later: CheckinTask[];
  };
  allCheckins: CheckinTask[];
}

export function CheckinNotifications() {
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCheckins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/upcoming-checkins');
      const data = await response.json();
      setCheckinData(data);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchCheckins, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'today':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'tomorrow':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'today':
        return 'border-l-red-500 bg-red-50';
      case 'tomorrow':
        return 'border-l-orange-500 bg-orange-50';
      case 'this_week':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const urgentCount = checkinData?.urgentCount || 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0"
          onClick={() => setIsOpen(true)}
        >
          <Bell className="h-4 w-4" />
          {urgentCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {urgentCount > 9 ? '9+' : urgentCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Próximos Check-ins
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">Cargando check-ins...</div>
            </div>
          ) : !checkinData || checkinData.totalUpcoming === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <div className="text-sm text-gray-500">No hay check-ins programados</div>
            </div>
          ) : (
            <>
              {/* Resumen */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">{checkinData.totalUpcoming}</span> check-ins próximos
                </div>
                {urgentCount > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{urgentCount} urgente{urgentCount > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Lista de check-ins */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {/* Hoy */}
                {checkinData.checkins.today.map((task) => (
                  <div
                    key={`today-${task.task_id}`}
                    className={`p-3 rounded-lg border-l-4 ${getUrgencyColor(task.urgency_level)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getUrgencyIcon(task.urgency_level)}
                          <span className="text-sm font-medium text-red-700">HOY</span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {task.task_name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{task.product_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{task.country_name}</span>
                          <span>•</span>
                          <span>{task.organization_name}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(task.checkin_date)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mañana */}
                {checkinData.checkins.tomorrow.map((task) => (
                  <div
                    key={`tomorrow-${task.task_id}`}
                    className={`p-3 rounded-lg border-l-4 ${getUrgencyColor(task.urgency_level)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getUrgencyIcon(task.urgency_level)}
                          <span className="text-sm font-medium text-orange-700">MAÑANA</span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {task.task_name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{task.product_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{task.country_name}</span>
                          <span>•</span>
                          <span>{task.organization_name}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(task.checkin_date)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Esta semana */}
                {checkinData.checkins.this_week.map((task) => (
                  <div
                    key={`week-${task.task_id}`}
                    className={`p-3 rounded-lg border-l-4 ${getUrgencyColor(task.urgency_level)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getUrgencyIcon(task.urgency_level)}
                          <span className="text-sm font-medium text-blue-700">ESTA SEMANA</span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {task.task_name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{task.product_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{task.country_name}</span>
                          <span>•</span>
                          <span>{task.organization_name}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(task.checkin_date)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Más adelante */}
                {checkinData.checkins.later.slice(0, 5).map((task) => (
                  <div
                    key={`later-${task.task_id}`}
                    className={`p-3 rounded-lg border-l-4 ${getUrgencyColor(task.urgency_level)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getUrgencyIcon(task.urgency_level)}
                          <span className="text-sm font-medium text-gray-700">PRÓXIMAMENTE</span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {task.task_name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{task.product_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{task.country_name}</span>
                          <span>•</span>
                          <span>{task.organization_name}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(task.checkin_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer con refresh */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Actualizado hace unos segundos
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchCheckins}
                  disabled={isLoading}
                  className="h-7 px-2 text-xs"
                >
                  Actualizar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}