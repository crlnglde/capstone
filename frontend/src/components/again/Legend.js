import React from "react";

const DisasterLegend = () => {
    const disasterTypes = [
      { name: "Fire Incident", color: "rgba(255, 99, 132, 0.7)" },
      { name: "Flood", color: "rgba(54, 162, 235, 0.7)" },
      { name: "Earthquake", color: "rgba(255, 159, 64, 0.7)" },
      { name: "Typhoon", color: "rgba(153, 102, 255, 0.7)" },
      { name: "Landslide", color: "rgba(139,69,19, 0.7)" },
      { name: "Other", color: "rgba(75, 192, 192, 0.7)" },
    ];
  
    return (
      <div className="legend">
        <h4>Disaster Types</h4>
        {disasterTypes.map((type) => (
          <div key={type.name} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: type.color }}></span>
            {type.name}
          </div>
        ))}
      </div>
    );
  };
  
export default DisasterLegend;