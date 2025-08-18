"use client"

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import TaskDetailModal from "@/components/task-detail-modal";
import AddTaskModal from "@/components/add-task-modal";

const phaseColors = {
  Planning: "#facc15",
  Elaboration: "#38bdf8", 
  Completion: "#91cb3e",
  "Sin fase": "#ccc",
};

interface Task {
  id: number;
  name: string;
  detail?: string;
  start_planned?: string;
  end_planned?: string;
  start_actual?: string;
  end_actual?: string;
  checkin_oro_verde?: string;
  checkin_user?: string;
  checkin_communication?: string;
  checkin_gender?: string;
  phase_id: number;
  phase_name?: string;
  status_id: number;
  status_name?: string;
  org_id?: number;
  org_name?: string;
  product_id: number;
  product_name?: string;
  created_at: string;
  updated_at: string;
}

interface GanttChartProps {
  tasks: Task[];
  refreshData: () => void;
}

const GanttChart = ({ tasks, refreshData }: GanttChartProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<SVGSVGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomMode, setZoomMode] = useState<"day" | "week" | "month">("day");

  const [tooltipData, setTooltipData] = useState<FormattedTask | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  interface FormattedTask {
    id: number;
    task_id: number;
    name: string;
    detail?: string;
    user: string;
    user_id?: number;
    start: Date | null;
    end: Date | null;
    actualStart: Date | null;
    actualEnd: Date | null;
    phase: string;
    status: string;
    product_id: number;
    checkin_communication?: string;
    checkin_gender?: string;
    checkin_oro_verde?: string;
    checkin_user?: string;
  }

  const formattedTasks = tasks.map(t => ({
    id: t.id,
    task_id: t.id,
    name: t.name,
    detail: t.detail,
    user: `${t.org_name || 'Sin organización'}`,
    user_id: t.org_id,
    start: t.start_planned ? new Date(t.start_planned) : null,
    end: t.end_planned ? new Date(t.end_planned) : null,
    actualStart: t.start_actual ? new Date(t.start_actual) : null,
    actualEnd: t.end_actual ? new Date(t.end_actual) : null,
    phase: t.phase_name || 'Sin fase',
    status: t.status_name || 'Sin estado',
    product_id: t.product_id,
    checkin_communication: t.checkin_communication,
    checkin_gender: t.checkin_gender,
    checkin_oro_verde: t.checkin_oro_verde,
    checkin_user: t.checkin_user,
  }));

  const validTasks = formattedTasks.filter(
    t => t.start instanceof Date && !isNaN(t.start.getTime()) && 
         t.end instanceof Date && !isNaN(t.end.getTime())
  );

  let x: d3.ScaleTime<number, number>;

  const scrollToToday = () => {
    if (!x) return;
    const today = new Date();
    const offset = x(today);
    scrollRef.current?.scrollTo({ left: offset - 200, behavior: "smooth" });
  };

  useEffect(() => {
    if (!validTasks.length) return;

    const rowHeight = 45;
    const chartHeight = validTasks.length * rowHeight;

    const minStart = d3.min(validTasks, d => d.start!);
    const maxEnd = d3.max(validTasks, d => d.end!);
    const startDate = d3.timeMonday.floor(d3.timeDay.offset(minStart!, -21));
    const endDate = d3.timeMonday.ceil(d3.timeDay.offset(maxEnd!, 30));

    const zoomMultipliers: Record<string, number> = { day: 30, week: 15, month: 8 };
    const dayWidth = zoomMultipliers[zoomMode];
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const width = totalDays * dayWidth;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    x = d3.scaleTime().domain([startDate, endDate]).range([0, width]);

    // Ordenar por fecha de inicio planeada
    const sortedByPlannedStart = [...validTasks].sort((a, b) => {
      const diff = a.start!.getTime() - b.start!.getTime();
      if (diff !== 0) return diff;
      const endDiff = (a.end!.getTime() - b.end!.getTime());
      if (endDiff !== 0) return endDiff;
      return a.name.localeCompare(b.name);
    });

    const y = d3.scaleBand()
      .domain(sortedByPlannedStart.map(d => d.name))
      .range([0, chartHeight])
      .padding(0.2);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.attr("width", width).attr("height", chartHeight + 200)
      .append("g").attr("transform", `translate(0,140)`);

    const header = svg.append("g").attr("transform", `translate(0,30)`);
    const weeks = d3.timeMonday.range(startDate, endDate);
    const monthGroups = d3.groups(weeks, d => d.getFullYear() + "-" + d.getMonth());

    // Definiciones de patrones
    const defs = svg.append("defs");

    defs.append("pattern")
      .attr("id", "actualHatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 8)
      .attr("height", 8)
      .append("path")
      .attr("d", "M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4")
      .attr("stroke", "#1F2B48")
      .attr("stroke-width", 2)
      .attr("opacity", 0.35);

    defs.append("pattern")
      .attr("id", "checkinHatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 8)
      .attr("height", 8)
      .append("path")
      .attr("d", "M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4")
      .attr("stroke", "#CB1973")
      .attr("stroke-width", 2)
      .attr("opacity", 0.45);

    // Header de semanas
    weeks.forEach((d) => {
      const xStart = x(d);
      const weekNumber = d3.timeFormat("%U")(d);
      const dateStr = d3.timeFormat("%d/%m/%y")(d);

      header.append("text")
        .attr("x", xStart + 4)
        .attr("y", 35)
        .text(`W${+weekNumber + 1}`)
        .attr("class", "text-xs fill-gray-600");

      header.append("text")
        .attr("x", xStart + 4)
        .attr("y", 50)
        .text(dateStr)
        .attr("class", "text-xs fill-gray-600");
    });

    const phaseGroups = d3.groups(validTasks, d => d.phase);

    // Líneas de la grilla
    g.selectAll("line.grid-week")
      .data(x.ticks(d3.timeMonday.every(1)!))
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#d1d5db")
      .attr("stroke-dasharray", "2,2");

    // Header de meses
    monthGroups.forEach(([, days]) => {
      const xStart = x(days[0]);
      const xEnd = x(d3.timeDay.offset(days[days.length - 1], 7));

      header.append("rect")
        .attr("x", xStart)
        .attr("y", 0)
        .attr("width", xEnd - xStart)
        .attr("height", 20)
        .attr("fill", "#d1d5db");

      header.append("text")
        .attr("x", xStart + 4)
        .attr("y", 15)
        .text(days[0].toLocaleString("en", { month: "long" }))
        .attr("class", "text-xs font-bold fill-gray-800");

      header.append("line")
        .attr("x1", xStart)
        .attr("x2", xStart)
        .attr("y1", 0)
        .attr("y2", 115)
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 1.5);

      g.append("line")
        .attr("x1", xStart)
        .attr("x2", xStart)
        .attr("y1", 0)
        .attr("y2", chartHeight + 140)
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 1.5);
    });

    // Header de fases
    phaseGroups.forEach(([phase, group]) => {
      const phaseStart = d3.min(group, d => d.start!);
      const phaseEnd = d3.max(group, d => d.end!);

      header.append("rect")
        .attr("x", x(phaseStart!))
        .attr("y", 65)
        .attr("width", x(phaseEnd!) - x(phaseStart!))
        .attr("height", 20)
        .attr("fill", phaseColors[phase as keyof typeof phaseColors] || "#ccc");

      header.append("text")
        .attr("x", (x(phaseStart!) + x(phaseEnd!)) / 2)
        .attr("y", 80)
        .text(phase)
        .attr("class", "text-xs font-bold fill-black")
        .attr("text-anchor", "middle");
    });

    // Líneas de las tareas
    g.selectAll("line.task-lines")
      .data(validTasks)
      .enter()
      .append("line")
      .attr("x1", -250)
      .attr("x2", width)
      .attr("y1", d => y(d.name)! + y.bandwidth())
      .attr("y2", d => y(d.name)! + y.bandwidth())
      .attr("stroke", "#d1d5db");

    // Barras principales de las tareas
    g.selectAll("rect.task-bar")
      .data(validTasks)
      .enter()
      .append("rect")
      .attr("x", d => x(d.start!))
      .attr("y", d => y(d.name)!)
      .attr("width", d => x(d.end!) - x(d.start!))
      .attr("height", y.bandwidth())
      .attr("rx", 6)
      .attr("fill", d => phaseColors[d.phase as keyof typeof phaseColors] || "#ccc")
      .attr("class", "shadow-sm")
      .style("cursor", "default")
      .on("mouseover", function (event, d) { 
        setTooltipData(d); 
      })
      .on("mousemove", function (event) {
        const tooltipWidth = 500;
        const tooltipHeight = 380;
        let mouseX = event.clientX + 20;
        let mouseY = event.clientY + 20;
        if (mouseX + tooltipWidth > window.innerWidth) {
          mouseX = window.innerWidth - tooltipWidth - 20;
        }
        if (mouseY + tooltipHeight > window.innerHeight) {
          mouseY = window.innerHeight - tooltipHeight - 20;
        }
        setTooltipPos({ x: mouseX, y: mouseY });
      })
      .on("mouseleave", function () {
        setTimeout(() => {
          if (!document.querySelector("#tooltip-hover:hover")) {
            setTooltipData(null);
          }
        }, 150);
      });

    // Overlay de duración real
    g.selectAll("rect.actual-bar")
      .data(
        validTasks.filter(
          d =>
            d.actualStart instanceof Date && !isNaN(d.actualStart.getTime()) &&
            d.actualEnd instanceof Date && !isNaN(d.actualEnd.getTime())
        )
      )
      .enter()
      .append("rect")
      .attr("class", "actual-bar")
      .attr("x", d => x(d.actualStart!))
      .attr("y", d => y(d.name)!)
      .attr("width", d => Math.max(0, x(d.actualEnd!) - x(d.actualStart!)))
      .attr("height", y.bandwidth())
      .attr("rx", 6)
      .attr("fill", "url(#actualHatch)")
      .attr("stroke", "#1F2B48")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4")
      .style("cursor", "default")
      .on("mouseover", (event, d) => { setTooltipData(d); })
      .on("mousemove", function (event) {
        const tooltipWidth = 500;
        const tooltipHeight = 380;
        let mouseX = event.clientX + 20;
        let mouseY = event.clientY + 20;
        if (mouseX + tooltipWidth > window.innerWidth) {
          mouseX = window.innerWidth - tooltipWidth - 20;
        }
        if (mouseY + tooltipHeight > window.innerHeight) {
          mouseY = window.innerHeight - tooltipHeight - 20;
        }
        setTooltipPos({ x: mouseX, y: mouseY });
      })
      .on("mouseleave", () => {
        setTimeout(() => {
          if (!document.querySelector("#tooltip-hover:hover")) {
            setTooltipData(null);
          }
        }, 150);
      });

    // Check-ins
    const oneDayMs = 24 * 60 * 60 * 1000;
    const checkins: Array<{ task: string; y: number; date: Date }> = [];
    validTasks.forEach(d => {
      const candidates = [
        d.checkin_communication,
        d.checkin_gender,
        d.checkin_oro_verde,
        d.checkin_user,
      ].filter(Boolean);

      candidates.forEach(c => {
        if (c && typeof c === 'string') {
          const dt = new Date(c);
          if (dt instanceof Date && !isNaN(dt.getTime())) {
            checkins.push({ task: d.name, y: y(d.name)!, date: dt });
          }
        }
      });
    });

    g.selectAll("rect.checkin")
      .data(checkins)
      .enter()
      .append("rect")
      .attr("class", "checkin")
      .attr("x", d => x(d.date))
      .attr("y", d => d.y + y.bandwidth() * 0.2)
      .attr("width", d => Math.max(2, x(new Date(d.date.getTime() + oneDayMs)) - x(d.date)))
      .attr("height", y.bandwidth() * 0.6)
      .attr("rx", 10)
      .attr("fill", "url(#checkinHatch)")
      .attr("stroke", "#CB1973")
      .attr("stroke-width", 2)
      .attr("pointer-events", "none");

    // Línea de "Today"
    const today = new Date();
    const todayX = x(today);
    g.append("line")
      .attr("x1", todayX)
      .attr("x2", todayX)
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#CB1973")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,2");

    g.append("text")
      .attr("x", todayX + 4)
      .attr("y", -10)
      .text(`Today (${d3.timeFormat("%d/%m/%Y")(today)})`)
      .attr("class", "text-xs text-gray-800 font-semibold");

    // PANEL IZQUIERDO
    const leftSVG = d3.select(fixedRef.current);
    leftSVG.selectAll("*").remove();
    leftSVG.attr("width", 249.5).attr("height", chartHeight + 200);

    const gLeft = leftSVG.append("g").attr("transform", `translate(0,140)`);

    // Grupo por fila
    const rows = gLeft.selectAll("g.row")
      .data(validTasks)
      .enter()
      .append("g")
      .attr("class", "row");

    // Rect transparente que cubre TODA la fila (hace click)
    rows.append("rect")
      .attr("x", 0)
      .attr("y", d => y(d.name)! - 8.3)
      .attr("width", 249.5)
      .attr("height", y.bandwidth() + 8)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("fill", "#f3f4f6");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "transparent");
      })
      .on("click", (event, d) => {
        setSelectedTaskId(d.task_id);
        setIsTaskModalOpen(true);
        setTooltipData(null);
      });

    // Texto del nombre
    rows.append("text")
      .attr("x", 10)
      .attr("y", d => y(d.name)! + y.bandwidth() / 2 + 4)
      .text(d => d.name.length > 25 ? `${d.name.slice(0, 25)}...` : d.name)
      .attr("class", "text-sm text-gray-800")
      .style("pointer-events", "none");

    gLeft.selectAll("line.task-lines-left")
      .data(validTasks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", 249.5)
      .attr("y1", d => y(d.name)! + y.bandwidth())
      .attr("y2", d => y(d.name)! + y.bandwidth())
      .attr("stroke", "#d1d5db");

    // Headers del panel izquierdo
    const headerHeight = 20;

    leftSVG.append("rect")
      .attr("x", 0)
      .attr("y", 30)
      .attr("width", 249.5)
      .attr("height", headerHeight)
      .attr("fill", "#d1d5db");

    leftSVG.append("text")
      .attr("x", 10)
      .attr("y", 45)
      .text("Month")
      .attr("class", "text-xs font-bold")
      .attr("fill", "#1f2937");

    const leftHeaders = ["Week", "Starts"];
    leftHeaders.forEach((label, i) => {
      leftSVG.append("text")
        .attr("x", 10)
        .attr("y", i * 15 + 65)
        .text(label)
        .attr("class", "text-xs")
        .attr("fill", "#1f2937");
    });

    leftSVG.append("text")
      .attr("x", 10)
      .attr("y", 105)
      .text("Phase")
      .attr("class", "text-xs font-bold")
      .attr("fill", "#1f2937");

  }, [validTasks, zoomMode]);

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleTaskUpdated = () => {
    refreshData();
    closeTaskModal();
  };

  const handleTaskDeleted = () => {
    refreshData();
    closeTaskModal();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Gantt Chart by Phases</h2>
        <div className="space-x-2">
          <button 
            onClick={scrollToToday} 
            className="px-2 py-1 rounded bg-[#CB1973] text-white hover:bg-[#a01359]"
          >
            Today
          </button>

          <button
            onClick={() => setZoomMode("day")}
            className={`px-2 py-1 rounded hover:bg-[#CB1973] hover:text-white ${
              zoomMode === "day" ? "bg-[#1F2B48] text-white" : "bg-gray-200"
            }`}
          >
            Day
          </button>

          <button
            onClick={() => setZoomMode("week")}
            className={`px-2 py-1 rounded hover:bg-[#CB1973] hover:text-white ${
              zoomMode === "week" ? "bg-[#1F2B48] text-white" : "bg-gray-200"
            }`} 
          >
            Week
          </button>

          <button
            onClick={() => setZoomMode("month")}
            className={`px-2 py-1 rounded hover:bg-[#CB1973] hover:text-white ${
              zoomMode === "month" ? "bg-[#1F2B48] text-white" : "bg-gray-200"
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      <div className="flex border rounded-md overflow-hidden">
        <div className="bg-white border-r" style={{ minWidth: "250px" }}>
          <svg ref={fixedRef}></svg>
        </div>
        <div ref={scrollRef} className="overflow-x-auto w-full">
          <svg ref={svgRef}></svg>
        </div>
      </div>

      {tooltipData && (
        <div
          id="tooltip-hover"
          className="fixed bg-white rounded-xl border shadow-lg p-6 text-sm z-50 w-[480px]"
          style={{
            top: tooltipPos.y,
            left: tooltipPos.x,
            pointerEvents: "auto",
          }}
          onMouseLeave={() => {
            setTooltipData(null);
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-semibold text-black leading-snug">
                {tooltipData.name}
              </h3>
              <p className="text-sm text-gray-800">
                <strong>Assigned to:</strong> {tooltipData.user}
              </p>
            </div>
            <div className="text-right text-sm text-gray-800 space-y-0.5">
              <p><strong>Status:</strong> {tooltipData.status}</p>
              <p>
                <strong>Delay:</strong>{" "}
                {tooltipData.actualStart && tooltipData.start
                  ? `${Math.round((tooltipData.actualStart.getTime() - tooltipData.start.getTime()) / (1000 * 60 * 60 * 24))} days`
                  : "N/A"}
              </p>
            </div>
          </div>

          <p className="text-gray-700 leading-normal mb-5">
            {tooltipData.detail || "No description provided."}
          </p>

          <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-800 mb-6">
            <div>
              <p className="font-semibold">Planned Start:</p>
              <p>{tooltipData.start ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tooltipData.start) : "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Planned End:</p>
              <p>{tooltipData.end ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tooltipData.end) : "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Actual Start:</p>
              <p>{tooltipData.actualStart ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tooltipData.actualStart) : "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Actual End:</p>
              <p>{tooltipData.actualEnd ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tooltipData.actualEnd) : "N/A"}</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSelectedTaskId(tooltipData.task_id);
                setIsTaskModalOpen(true);
                setTooltipData(null);
              }}
              className="px-5 py-2 text-sm bg-[#1F2B48] text-white rounded-md hover:bg-[#CB1973] transition"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalle de tarea */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/* Modal de agregar tarea */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskAdded={refreshData}
        productId={tasks[0]?.product_id?.toString() || null}
      />
    </div>
  );
};

export default GanttChart;
