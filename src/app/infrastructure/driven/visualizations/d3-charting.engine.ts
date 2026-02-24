// src/app/infrastructure/driven/visualizations/d3-charting.engine.ts
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Observable, Subscription } from 'rxjs';
import {
  RadarChartPort,
  WaveChartPort,
  GForceChartPort,
  ChartHistoryLinePort,
} from '../../../core/ports/visuals/charting.port';

@Injectable({ providedIn: 'root' })
export class D3ChartingEngine
  implements RadarChartPort, WaveChartPort, GForceChartPort, ChartHistoryLinePort
{
  /**
   * RENDER RADAR: Skills del conductor
   */
  renderRadar(
    container: HTMLElement,
    data: { axis: string; value: number }[],
    mainColor: string,
    areaColor: string,
  ): void {
    d3.select(container).selectAll('*').remove();

    const width = container.offsetWidth || 300;
    const height = container.offsetHeight || 300;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;
    const angleSlice = (Math.PI * 2) / data.length;

    // --- LÓGICA DE COLOR DINÁMICO ---
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // --- EJES Y ETIQUETAS ---
    const axis = svg.selectAll('.axis').data(data).enter().append('g').attr('class', 'axis');

    axis
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (_, i) => rScale(1.1) * Math.cos(i * angleSlice - Math.PI / 2))
      .attr('y2', (_, i) => rScale(1.1) * Math.sin(i * angleSlice - Math.PI / 2))
      .attr('stroke', 'rgba(255,255,255,0.1)');

    axis
      .append('text')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (_, i) => rScale(1.3) * Math.cos(i * angleSlice - Math.PI / 2))
      .attr('y', (_, i) => rScale(1.3) * Math.sin(i * angleSlice - Math.PI / 2))
      .text((d) => d.axis.toUpperCase())
      .attr('fill', mainColor) // El texto también cambia de color
      .style('transition', 'fill 0.5s ease');

    // --- GRID CIRCULAR ---
    svg
      .selectAll('.grid-circle')
      .data([0.2, 0.4, 0.6, 0.8, 1])
      .enter()
      .append('circle')
      .attr('r', (d) => rScale(d))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.05)');

    // --- POLÍGONO DINÁMICO ---
    const radarLine = d3
      .lineRadial<{ axis: string; value: number }>()
      .radius((d) => rScale(d.value))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const path = svg
      .append('path')
      .datum(data)
      .attr('d', radarLine)
      .attr('fill', areaColor)
      .attr('stroke', mainColor)
      .attr('stroke-width', 2)
      .style('filter', `drop-shadow(0 0 8px ${mainColor})`)
      .style('transition', 'all 0.5s ease');

    // Animación opcional para estados críticos (lógica movida a use case)
    // if (isCritical) { ... } - Removido para abstracción
  }

  /**
   * RENDER WAVE: Osciloscopio HRV en tiempo real
   */
  renderWave(
    container: HTMLElement,
    stream$: Observable<{ avgHRV: number; stressZone: string }>,
  ): Subscription {
    // 1. LIMPIEZA SELECTIVA: Solo borramos el SVG, no el overlay HTML
    d3.select(container).select('svg').remove();

    const width = container.offsetWidth || 600;
    const height = container.offsetHeight || 200;
    const points = 40;
    let data = Array(points).fill(60);

    // 2. CREACIÓN DEL SVG
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none')
      .style('position', 'absolute') // Aseguramos que se comporte como capa de fondo
      .style('top', '0')
      .style('left', '0');

    const x = d3
      .scaleLinear()
      .domain([0, points - 1])
      .range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([40, 120])
      .range([height - 10, 10]);

    const line = d3
      .line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#00ffcc')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 0 5px #00ffcc)');

    return stream$.subscribe((val) => {
      data.push(val.avgHRV);
      data.shift();

      const colorMap: any = { LOW: '#00d4ff', OPTIMAL: '#00ffcc', HIGH: '#ff4757' };
      const color = colorMap[val.stressZone] || '#00ffcc';

      // Actualización de la línea
      path
        .datum(data)
        .transition()
        .duration(200)
        .ease(d3.easeLinear)
        .attr('d', line)
        .attr('stroke', color);

      // 3. ACTUALIZACIÓN DEL CONTADOR (Ahora existe porque no lo borramos)
      const hrvNumber = d3.select(container).select('#hrv-number');

      if (!hrvNumber.empty()) {
        hrvNumber
          .transition()
          .duration(200)
          .style('color', color)
          .tween('text', function () {
            const that = d3.select(this);
            const current = +that.text() || 0;
            const i = d3.interpolateRound(current, val.avgHRV);
            return (t: number) => {
              that.text(i(t));
            };
          });
      }
    });
  }
  /**
   * RENDER G-FORCE: Vector de inercia
   */
  renderGForce(container: HTMLElement, data$: Observable<{ x: number; y: number }>): Subscription {
    d3.select(container).selectAll('*').remove();
    const size = 200;
    const center = size / 2;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', `0 0 ${size} ${size}`);

    // Grid de fondo
    svg
      .append('circle')
      .attr('cx', center)
      .attr('cy', center)
      .attr('r', 80)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.1)');
    svg
      .append('circle')
      .attr('cx', center)
      .attr('cy', center)
      .attr('r', 40)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.1)');

    const vector = svg
      .append('line')
      .attr('x1', center)
      .attr('y1', center)
      .attr('x2', center)
      .attr('y2', center)
      .attr('stroke', '#ff4757')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .style('filter', 'drop-shadow(0 0 8px #ff4757)');

    return data$.subscribe((pos) => {
      vector
        .transition()
        .duration(300)
        .attr('x2', center + pos.x * 50) // Escala de fuerza
        .attr('y2', center + pos.y * 50);
    });
  }

  renderHistoryLine(container: HTMLElement, data: { time: string; value: number }[]) {
    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('overflow', 'visible');

    // --- 1. ETIQUETA DE MÉTRICA (Contexto para el usuario) ---
    svg
      .append('text')
      .attr('x', margin.left)
      .attr('y', 20)
      .attr('class', 'fill-indigo-400 font-black text-[9px] uppercase tracking-[0.2em]')
      .text('● Engine_Core_Thermal_History (Celsius)');

    // --- 2. ESCALAS ---
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.time))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)! * 1.4])
      .range([height - margin.bottom, margin.top]);

    // --- 3. REJILLA Y EJES ---
    svg
      .append('g')
      .attr('class', 'grid opacity-10')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(() => '')
          .ticks(5),
      );

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .attr('class', 'text-slate-500 font-mono text-[8px] opacity-50')
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => !(i % 6))));

    // --- 4. DEGRADADO Y LÍNEA ---
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'line-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 0.3);
    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 0);

    const area = d3
      .area<{ time: string; value: number }>()
      .x((d) => x(d.time)!)
      .y0(height - margin.bottom)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path').datum(data).attr('fill', 'url(#line-grad)').attr('d', area);

    const line = d3
      .line<{ time: string; value: number }>()
      .x((d) => x(d.time)!)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#818cf8')
      .attr('stroke-width', 2)
      .attr('class', 'drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]')
      .attr('d', line);

    // --- 5. TOOLTIP (EL IMÁN CORREGIDO) ---
    const focus = svg.append('g').style('display', 'none');

    focus
      .append('line')
      .attr('class', 'stroke-indigo-500/40')
      .attr('stroke-dasharray', '4,4')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    focus
      .append('circle')
      .attr('r', 5)
      .attr('class', 'fill-white stroke-indigo-400 stroke-2 shadow-[0_0_15px_white]');

    const tooltip = focus.append('g').attr('transform', 'translate(12, -25)');

    tooltip
      .append('rect')
      .attr('width', 90)
      .attr('height', 40)
      .attr('rx', 6)
      .attr('class', 'fill-slate-950/95 stroke-indigo-500/50 backdrop-blur-md');

    const textTime = tooltip
      .append('text')
      .attr('x', 8)
      .attr('y', 16)
      .attr('class', 'fill-slate-500 font-mono text-[8px]');
    const textValue = tooltip
      .append('text')
      .attr('x', 8)
      .attr('y', 31)
      .attr('class', 'fill-white font-black font-mono text-[11px]');

    // --- 6. INTERACCIÓN ---
    const xPositions = data.map((d) => x(d.time)!);

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        // Aquí el cambio clave: Buscamos el índice más cercano a la posición X del mouse
        const closestIndex = d3.leastIndex(xPositions, (d) => Math.abs(d - mouseX));

        if (closestIndex !== undefined && closestIndex !== -1) {
          const d = data[closestIndex];
          const posX = x(d.time)!;
          const posY = y(d.value);

          focus.attr('transform', `translate(${posX},0)`);
          focus.select('circle').attr('cy', posY);

          // Voltear tooltip si está muy a la derecha
          const flip = posX > width * 0.75;
          tooltip.attr('transform', `translate(${flip ? -100 : 12}, ${posY - 45})`);

          textTime.text(`UTC: ${d.time}`);
          textValue.text(`${d.value.toFixed(1)} °C`);
        }
      });
  }
}
