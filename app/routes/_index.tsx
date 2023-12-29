import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import '../root.css'
import { useState } from "react";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const gameModes = {
  ashikaIsland: "Resurgence",
  alMazrah: "Warzone", 
  mw2Ranked: "MW2 Ranked",
  wz2Ranked: "WZ2 Ranked",
  mw3: "MW3",
  mwz: "MWZ",
}

export const loader = async () => {
  const params = {
    "streamerProfileId": "wzstats",
    "weaponGames": ["mw3","mw2"],
    weaponAttributes: [
      "game",
      "name",
      "type",
      "isNew",
      "recoil",
      "adsTime",
      "updateMW2",
      "updateWZ2",
      "averageTTKLong",
      "averageTTKShort",
      "bulletVelocity",
      "movementSpeed",
      "adsMovementSpeed",
      "unlockCondition",
      "description",
      "shortDescription",
    ]
  }

  function buildParams(data) {
    const params = new URLSearchParams()

    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(value => params.append(key, value.toString()))
        } else {
            params.append(key, value.toString())
        }
    });
    return params.toString()
  }
  const fetchData = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data
  }
  const parseParams = () => {
    return Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
  }
  const urlSearchParams = new URLSearchParams(buildParams(params))
  const url2 = `https://app.wzstats.gg/wz2/weapons/meta/weapons-and-tier-lists/?${urlSearchParams}`
  const data = await fetchData(url2);
  const attachments = await fetchData("https://app.wzstats.gg/wz2/weapons/builds/wzstats/with-attachments/?game=wz2")
  return json({ data, attachments });
};

export default function Index() {
  const { data, attachments } = useLoaderData();
  const [selectedTab, setSelectedTab] = useState('ashikaIsland')
  const onChangeTab = (key) => {
    setSelectedTab(key)
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      {/* {data.weapons?.map((weapon: any) => (
        <div>
          <h1>{weapon.name}</h1>
          <p>{weapon.description}</p>
        </div>
      ))} */}
      {/* <WeaponGrid /> */}
      <div className="tabs">
        {Object.entries(data.wzStatsTierList)
          .filter(([key, value]) => typeof value === "object")
          .map(([key]) => (
            <div
              key={key}
              onClick={() => onChangeTab(key)}
              className="tab"
              data-active={key === selectedTab}
            >
              {gameModes[key]}
            </div>
        ))}
      </div>
      {Object.entries(data.wzStatsTierList)
        .filter(([key, value]) => typeof value === "object" && key === selectedTab)
        .map(([key, value]) => (
          <div key={key}>
            {Object.entries(value).map(([key2, value2]) => (
              <div key={key2}>
                <h2>{key2}</h2>
                <div className="weapons">
                  {value2.map((value3) => (
                    <Weapon key={value3} weapon={value3} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

const Weapon = ({ weapon }) => {
  const { data, attachments } = useLoaderData();
  const [isExpanded, setIsExpanded] = useState(true)
  const attachment = attachments.builds.filter((attachment) => attachment.weaponId === weapon);
  // console.log(attachment);
  const getWeaponName = (weapon) => {
    return data.weapons.find((item) => item.id === weapon)?.name
  }
  return (
    <div className="weapon">
      <div className="weapon__title" onClick={() => setIsExpanded(!isExpanded)}>
        <img
          alt={weapon}
          src={`https://imagedelivery.net/BN5t48p9frV5wW3Jpe6Ujw/${weapon}-bold/gunDisplayLoadouts`}
        />
        <h3>{getWeaponName(weapon)}</h3>
      </div>
      {isExpanded && (
        <div className="builds">
          {attachment
            .sort((a, b) => a.position - b.position)
            .map((build) => (
              <Build key={build.id} build={build} />
          ))}
        </div>
      )}
    </div>
  );
}

const Build = ({ build }) => {
  const attachments = Object.entries(build).filter(([key, value]) => value?.attachmentId);
  const isBest = Object.keys(build).some((key) => key.includes("Best"))
  return (
    <div className="build">
      <h4>{build.playstyle} {isBest ? "*" : ""}</h4>
      {/* <WeaponGrid2 build={build} /> */}
      <WeaponGrid3 build={build} />
      {/* <div className="attachments">
        {attachments
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, value]) => (
          <div key={key} className="attachment">
            <h5>{key}</h5>
            <span>{value.name}</span>
          </div>
        ))}
      </div> */}
    </div>
  )
}

const slots = [
  'muzzle',
  'barrel',
  'laser',
  'optic',
  'stock',
  'comb',
  'underbarrel',
  'ammunition',
  'magazine',
  'rearGrip',
  'aftermarketParts',
]

const WeaponGrid = () => {
  return (
    <div className="weapon__grid">
      {slots.map((slot) => (
        <div key={slot} style={{ gridArea: slot }}>
          <h3>{slot}</h3>
        </div>
      ))}
    </div>
  )
}
const WeaponGrid2 = ({ build }) => {
  return (
    <div className="weapon__grid">
      {slots.map((slot) => (
        <div
          key={slot}
          style={{ gridArea: slot }}
          className="attachment"
          data-empty={!build[slot]}
        >
          <h5>{slot}</h5>
          <span>{build[slot]?.name}</span>
        </div>
      ))}
    </div>
  )
}

const WeaponGrid3 = ({ build }) => {
  return (
    <div className="weapon__grid3">
      {slots.map((slot) => (
        <div
          key={slot}
          style={{ gridArea: slot }}
          className="attachment"
          data-empty={!build[slot]}
        >
          <h5>{slot}</h5>
          <span>{build[slot]?.name}</span>
        </div>
      ))}
    </div>
  )
}