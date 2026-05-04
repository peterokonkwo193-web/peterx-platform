import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const CandlestickChart = ({ data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  // Initialize Chart
  useEffect(() => {
    const isLight = localStorage.getItem('terminal-theme') === 'light';
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isLight ? '#ffffff' : '#0a0b0d' },
        textColor: isLight ? '#131722' : '#d1d4dc',
      },
      grid: {
        vertLines: { color: isLight ? '#f0f3fa' : 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: isLight ? '#f0f3fa' : 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#787b86',
          width: 1,
          style: 1,
          labelBackgroundColor: '#131722',
        },
        horzLine: {
          color: '#787b86',
          width: 1,
          style: 1,
          labelBackgroundColor: '#131722',
        },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#0ECB81',
      downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#0ECB81',
      wickDownColor: '#F6465D',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', 
    });

    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update Data
  useEffect(() => {
    if (candlestickSeriesRef.current && data && data.length > 0) {
      // Full data set update
      candlestickSeriesRef.current.setData(data);

      const volumeData = data.map(d => ({
        time: d.time,
        value: d.volume || 100,
        color: d.close >= d.open ? 'rgba(14, 203, 129, 0.5)' : 'rgba(246, 70, 93, 0.5)'
      }));
      volumeSeriesRef.current.setData(volumeData);
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default CandlestickChart;
