import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Tooltip } from '@/components/ui/tooltip'; // Importar Tooltip
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'; // Importar componentes do Tooltip

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface CountryPlayData {
  country: string;
  count: number;
}

interface CountryPlaysMapProps {
  playsByCountry: CountryPlayData[];
}

const CountryPlaysMap: React.FC<CountryPlaysMapProps> = ({ playsByCountry }) => {
  const maxPlays = Math.max(...playsByCountry.map(d => d.count), 1); // Evitar divisão por zero
  const colorScale = scaleLinear<string>()
    .domain([0, maxPlays])
    .range(["#2c3e50", "#1DB954"]); // De um cinza escuro para o verde do podcast

  const countryDataMap = new Map(playsByCountry.map(d => [d.country, d.count]));

  return (
    <div className="w-full h-[500px] bg-podcast-black-light rounded-lg p-4 flex items-center justify-center">
      <ComposableMap
        projectionConfig={{
          scale: 150,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = geo.properties.ISO_A2;
                const plays = countryDataMap.get(countryCode) || 0;
                const countryName = geo.properties.NAME;

                return (
                  <TooltipProvider key={geo.rsmKey}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          fill={colorScale(plays)}
                          stroke="#333333"
                          strokeWidth={0.5}
                          style={{
                            default: {
                              outline: "none",
                            },
                            hover: {
                              fill: "#1ED760", // Um verde mais claro no hover
                              outline: "none",
                            },
                            pressed: {
                              outline: "none",
                            },
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-podcast-black-light text-podcast-white border border-podcast-border p-2 rounded-md shadow-lg z-50">
                        <p className="font-bold">{countryName}</p>
                        <p>Reproduções: {plays}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default CountryPlaysMap;