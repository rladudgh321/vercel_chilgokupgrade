import { IBuild } from "@/app/interface/build";

const AreaInfo = ({ listing }: { listing: IBuild }) => {
  const areas = [
    { label: "실면적", value: listing.actualArea },
    { label: "공급면적", value: listing.supplyArea },
    { label: "대지면적", value: listing.landArea },
    { label: "건축면적", value: listing.buildingArea },
    { label: "연면적", value: listing.totalArea },
  ];

  const validAreas = areas.filter(area => area.value && Number(area.value) > 0);

  if (validAreas.length === 0) {
    return null;
  }

  return (
    <div>
      {validAreas.map((area, index) => (
        <span key={area.label}>
          {area.label} {area.value}평{index < validAreas.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </div>
  );
};

export default AreaInfo;