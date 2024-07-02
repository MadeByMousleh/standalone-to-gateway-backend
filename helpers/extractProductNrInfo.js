

const productNumberToSensor = {
    "353-601021": { text: "P47MR - DALI-2 master presence detector, 12-13 m, flush mounting, White (RAL 9010)" },
    "353-601111": { text: "P47LR - DALI-2 master presence detector, 32-37 m, flush mounting, White (RAL 9010)" },
    "353-601121": { text: "P46MR - DALI-2 secondary presence detector, 12-13 m, flush mounting, White (RAL 9010)" },
    "353-601221": { text: "P46LR - DALI-2 secondary presence detector, 32-37 m, flush mounting, White (RAL 9010)" },
    "353-651021": { text: "P48MR - DALI-2 master presence detector, 12-13 m, flush mounting (SnapFit), White (RAL 9010) / Black (RAL 9005)" },
    "353-651321": { text: "P48LR - DALI-2 master presence detector, 32-37 m, flush mounting (SnapFit), White (RAL 9010) / Black (RAL 9005)" },
    "353-701021": { text: "P47MR - DALI-2 master presence detector, 12-13 m, surface mounting, White (RAL 9010)" },
    "353-701111": { text: "P47LR - DALI-2 master presence detector, 32-37 m, surface mounting, White (RAL 9010)" },
    "353-701121": { text: "P46MR - DALI-2 secondary presence detector, 12-13 m, surface mounting, White (RAL 9010)" },
    "353-701221": { text: "P46LR - DALI-2 secondary presence detector, 32-37 m, surface mounting, White (RAL 9010)" },
    "353-751021": { text: "P48MR - DALI-2 master presence detector, 12-13 m, surface mounting (SnapFit), White (RAL 9010) / Black (RAL 9005)" },
    "353-751321": { text: "P48LR - DALI-2 master presence detector, 32-37 m, surface mounting (SnapFit), White (RAL 9010) / Black (RAL 9005)" },
    "353-601031": { text: "P42 - 230V master indoor detector, flush mounting, White (RAL 9010)" },
    "353-601131": { text: "P41 - 230V secondary indoor detector, flush mounting, White (RAL 9010)" },
    "353-651131": { text: "P42 - 230V master indoor detector, surface mounting, White (RAL 9010)" },
    "353-701231": { text: "P41 - 230V secondary indoor detector, surface mounting, White (RAL 9010)" },
    "353-650021": { text: "M47MR - DALI-2 master presence detector, 12-13 m, surface mounting, White (RAL 9010)" },
    "353-650321": { text: "M47LR - DALI-2 master presence detector, 32-37 m, surface mounting, White (RAL 9010)" },
    "353-651021": { text: "M46MR - DALI-2 secondary presence detector, 12-13 m, surface mounting, White (RAL 9010)" },
    "353-651421": { text: "M46LR - DALI-2 secondary presence detector, 32-37 m, surface mounting, White (RAL 9010)" },
    "353-751021": { text: "M48MR - DALI-2 master presence detector, 12-13 m, surface mounting (SnapFit), White (RAL 9010) / Black (RAL 9005)" },
    "353-751321": { text: "M48LR - DALI-2 master presence detector, 32-37 m, surface mounting (SnapFit), White (RAL 9010) / Black (RAL 9005)" },
    "353-601041": { text: "M42 - 230V master indoor detector, flush mounting, White (RAL 9010)" },
    "353-601141": { text: "M41 - 230V secondary indoor detector, flush mounting, White (RAL 9010)" },
    "353-651141": { text: "M42 - 230V master indoor detector, surface mounting, White (RAL 9010)" },
    "353-701241": { text: "M41 - 230V secondary indoor detector, surface mounting, White (RAL 9010)" }
};

const numberToProductNumberConverter = {
    1: {
        Id: "e5ecc01e-abc1-40fd-a3ac-71ff759b9df9",
        Name: "353-600021",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeSlave",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P41MR",
        Range: 14,
        DetectorMountDescription: "flushMountingBox"
    },
    2: {
        Id: "139398af-887c-4564-aba0-ad9cf4f3829f",
        Name: "353-600121",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42MR",
        Range: 14,
        DetectorMountDescription: "flushMountingBox"
    },
    3: {
        Id: "66794d39-7c7d-4694-a9b4-fc653cf98cb1",
        Name: "353-601021",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeSlave",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P41MR",
        Range: 14,
        DetectorMountDescription: "flushMounting"
    },
    4: {
        Id: "e7cfce75-31a7-4c55-8bce-f3ac86c0453f",
        Name: "353-601121",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42MR",
        Range: 14,
        DetectorMountDescription: "flushMounting"
    },
    5: {
        Id: "0bb6b805-a230-4173-abcd-4751edcbd08d",
        Name: "353-601221",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "twoChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42MR",
        Range: 14,
        DetectorMountDescription: "flushMounting"
    },
    6: {
        Id: "b380e2c6-cf23-45d6-b9f8-bc4c56ea9799",
        Name: "353-602021",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeSlave",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P41MR",
        Range: 14,
        DetectorMountDescription: "surfaceMounting"
    },
    7: {
        Id: "c71796bd-b6e6-424a-b3f4-0963f6ff0302",
        Name: "353-602121",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42MR",
        Range: 14,
        DetectorMountDescription: "surfaceMounting"
    },
    8: {
        Id: "57fbb2be-e960-4b2d-9197-d492aa1333e5",
        Name: "353-602221",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "twoChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42MR",
        Range: 14,
        DetectorMountDescription: "surfaceMounting"
    },
    9: {
        Id: "5e44da87-94d3-429f-bb8b-5c323ea66af5",
        Name: "353-650021",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46MR",
        Range: 14,
        DetectorMountDescription: "flushMountingBox"
    },
    10: {
        Id: "4e13c2bb-d6a3-45a8-ba1a-51b16290ebba",
        Name: "353-650321",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "standard",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P47MR",
        Range: 14,
        DetectorMountDescription: "flushMountingBox"
    },
    11: {
        Id: "5fd371f5-f6a6-463a-8694-d6bc53e94f6c",
        Name: "353-651021",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46MR",
        Range: 14,
        DetectorMountDescription: "flushMounting"
    },
    12: {
        Id: "b5c42413-a1c3-4f41-a7a3-a2ace3a6df5b",
        Name: "353-651321",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "standard",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P47MR",
        Range: 14,
        DetectorMountDescription: "flushMounting"
    },
    13: {
        Id: "059b7201-da9f-4a16-8781-b4b42c2ebff2",
        Name: "353-651421",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "daliComfort",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P48MR",
        Range: 14,
        DetectorMountDescription: "flushMounting"
    },
    14: {
        Id: "990f311c-8c6f-466f-ae10-825ecbb71608",
        Name: "353-652021",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46MR",
        Range: 14,
        DetectorMountDescription: "surfaceMounting"
    },
    15: {
        Id: "d803e945-05c6-4d2a-b14d-02c085b55892",
        Name: "353-652321",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "standard",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P47MR",
        Range: 14,
        DetectorMountDescription: "surfaceMounting"
    },
    16: {
        Id: "2ce22ed7-1217-4197-aaa6-ad522e7d0221",
        Name: "353-652421",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "daliComfort",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P48MR",
        Range: 14,
        DetectorMountDescription: "surfaceMounting"
    },
    17: {
        Id: "a0e4055b-dbe1-40ab-a2f1-caadcc45d107",
        Name: "353-700021",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeSlave",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P41LR",
        Range: 32,
        DetectorMountDescription: "flushMountingBox"
    },
    18: {
        Id: "4394eb8e-7092-47d9-979c-33ada900672c",
        Name: "353-700121",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42LR",
        Range: 32,
        DetectorMountDescription: "flushMountingBox"
    },
    19: {
        Id: "ef43a417-68dc-4f74-a657-4d97d8a1b032",
        Name: "353-701021",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeSlave",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P41LR",
        Range: 32,
        DetectorMountDescription: "flushMounting"
    },
    20: {
        Id: "555cca43-8758-43fa-a753-f98fdd35f1bf",
        Name: "353-701121",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42LR",
        Range: 32,
        DetectorMountDescription: "flushMounting"
    },
    21: {
        Id: "bf02c1c2-0a75-4d55-85c3-8ccc7819fdbc",
        Name: "353-701221",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "twoChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42LR",
        Range: 32,
        DetectorMountDescription: "flushMounting"
    },
    22: {
        Id: "fe506fad-464c-41e3-8ce3-c3251db94718",
        Name: "353-702021",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeSlave",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P41LR",
        Range: 32,
        DetectorMountDescription: "surfaceMounting"
    },
    23: {
        Id: "ebbd8bd5-199c-499b-b15a-220def33380a",
        Name: "353-702121",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42LR",
        Range: 32,
        DetectorMountDescription: "surfaceMounting"
    },
    24: {
        Id: "87c2b99f-a072-4a38-8a2e-e69c87b13c9b",
        Name: "353-702221",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "twoChannel",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P42LR",
        Range: 32,
        DetectorMountDescription: "surfaceMounting"
    },
    25: {
        Id: "d2e8e883-e07e-4fe7-959d-1a1e6cb41929",
        Name: "353-750021",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46LR",
        Range: 32,
        DetectorMountDescription: "flushMountingBox"
    },
    26: {
        Id: "87818cdd-64aa-4040-aec3-4a68753c3d7a",
        Name: "353-750321",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "standard",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P47LR",
        Range: 32,
        DetectorMountDescription: "flushMountingBox"
    },
    27: {
        Id: "a929284c-e1ab-4873-bfd2-f062154010a3",
        Name: "353-751021",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46LR",
        Range: 32,
        DetectorMountDescription: "flushMounting"
    },
    28: {
        Id: "43c3fbcf-3d58-477a-be70-c970dc3e5486",
        Name: "353-751321",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "standard",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P47LR",
        Range: 32,
        DetectorMountDescription: "flushMounting"
    },
    29: {
        Id: "d73d381c-ba55-4ec0-98b2-13a7ac5cec35",
        Name: "353-751421",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "daliComfort",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P48LR",
        Range: 32,
        DetectorMountDescription: "flushMounting"
    },
    30: {
        Id: "83ccc5be-9053-46b8-a6a7-651944a6caaf",
        Name: "353-752021",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46LR",
        Range: 32,
        DetectorMountDescription: "surfaceMounting"
    },
    31: {
        Id: "326ce55e-dcbc-408c-886c-a8cb019d80de",
        Name: "353-752321",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "standard",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P47LR",
        Range: 32,
        DetectorMountDescription: "surfaceMounting"
    },
    32: {
        Id: "49d91a4b-a6f6-44f6-afc9-ff8fb6863133",
        Name: "353-752421",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "daliComfort",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P48LR",
        Range: 32,
        DetectorMountDescription: "surfaceMounting"
    },
    33: {
        Id: "3c18262c-1d32-4f13-a251-5bf7fb1fd32f",
        Name: "353-802011",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeSlave",
        DetectorOutputInfo: "",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M41HC",
        Range: 40,
        DetectorMountDescription: "surfaceMounting"
    },
    34: {
        Id: "173d4496-a4f4-4026-9caf-f23a395d7624",
        Name: "353-802111",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M42HC",
        Range: 40,
        DetectorMountDescription: "surfaceMounting"
    },
    35: {
        Id: "7250b615-a237-459e-b0af-bf4c0baf4719",
        Name: "353-852011",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M46HC",
        Range: 40,
        DetectorMountDescription: "surfaceMounting"
    },
    36: {
        Id: "5eae4a84-5c7d-41b7-bb5c-a6850fb7af46",
        Name: "353-852411",
        DetectorFamily: "dali2Detector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "daliComfort",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M48HC",
        Range: 40,
        DetectorMountDescription: "surfaceMounting"
    },
    37: {
        Id: "171796bd-b6e6-424a-b3f4-0963f6ff0302",
        Name: "353-602111",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M42MR",
        Range: 14,
        DetectorMountDescription: "surfaceMounting"
    },
    38: {
        Id: "1bbd8bd5-199c-499b-b15a-220def33380a",
        Name: "353-702111",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M42LR",
        Range: 32,
        DetectorMountDescription: "surfaceMounting"
    },
    39: {
        Id: "239398af-887c-4564-aba0-ad9cf4f3829f",
        Name: "353-600111",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M42MR",
        Range: 14,
        DetectorMountDescription: "flushMountingBox"
    },
    40: {
        Id: "17cfce75-31a7-4c55-8bce-f3ac86c0453f",
        Name: "353-601111",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M42MR",
        Range: 14,
        DetectorMountDescription: "flushMounting"
    },
    41: {
        Id: "1394eb8e-7092-47d9-979c-33ada900672c",
        Name: "353-700111",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M42LR",
        Range: 32,
        DetectorMountDescription: "flushMountingBox"
    },
    42: {
        Id: "155cca43-8758-43fa-a753-f98fdd35f1bf",
        Name: "353-701111",
        DetectorFamily: "230VDectector",
        DetectorType: "detectorTypeMaster",
        DetectorOutputInfo: "oneChannel",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M42LR",
        Range: 32,
        DetectorMountDescription: "flushMounting"
    },
    43: {
        Id: "155cca43-8758-43aa-a753-f98fdd35f1bf",
        Name: "353-650521",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46MR",
        Range: 13,
        DetectorMountDescription: "flushMountingBox"
    },
    44: {
        Id: "155cca43-8758-41aa-a753-f98fdd35f1bf",
        Name: "353-651521",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46MR",
        Range: 13,
        DetectorMountDescription: "flushMountingBox"
    },
    45: {
        Id: "155cca43-8758-11aa-a753-f98fdd35f1bf",
        Name: "353-652521",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46MR",
        Range: 13,
        DetectorMountDescription: "surfaceMounting"
    },
    46: {
        Id: "155cca43-8758-21aa-a753-f98fdd35f1bf",
        Name: "353-750521",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46LR",
        Range: 37,
        DetectorMountDescription: "flushMountingBox"
    },
    47: {
        Id: "155cca43-8758-31aa-a753-f98fdd35f1bf",
        Name: "353-751521",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46LR",
        Range: 37,
        DetectorMountDescription: "flushMountingBox"
    },
    48: {
        Id: "155cca43-8758-51aa-a753-f98fdd35f1bf",
        Name: "353-752521",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "presenceDectector360",
        DetectorShortDescription: "P46LR",
        Range: 37,
        DetectorMountDescription: "surfaceMounting"
    },
    49: {
        Id: "155cca43-8758-61aa-a753-f98fdd35f1bf",
        Name: "353-852511",
        DetectorFamily: "dali2DetectorBMS",
        DetectorType: "detectorTypeDaliBMS",
        DetectorOutputInfo: "",
        DetectorDescription: "motionDectector360",
        DetectorShortDescription: "M46HC",
        Range: 53,
        DetectorMountDescription: "surfaceMounting"
    }
};



let sensorSeries = {
    0: "Not yet in use",
    1: "Mini",
    2: "Outdoor",
    3: "Not yet in use",
    4: "Not yet in use",
    5: "Not yet in use",
    6: "Medium range",
    7: "Long range",
    8: "High Cieling",
    9: "Accessories"
};

let technology = {
    0: "230V",
    1: "NHC",
    2: "24 V",
    3: "KNX",
    4: "Not yet in use",
    5: "DALI",
    6: "DALI wireless",
    7: "On/Off wireless",
    8: "Not yet in use",
    9: "No value"
};

let mounting = {
    0: "Ceiling, flush box",
    1: "ceiling, flush",
    2: "ceiling, surface",
    3: "Wall",
    4: "Wall flush",
    5: "Not yet in use",
    6: "Not yet in use",
    7: "Not yet in use",
    8: "Not yet in use",
    9: "No value"
};

let output = {
    0: "BMS",
    1: "1 channel",
    2: "2 channels",
    3: "Standard",
    4: "Comfort",
    5: "Not yet in use",
    6: "Not yet in use",
    7: "Not yet in use",
    8: "Not yet in use",
    9: "No value"
};

let detection = {
    0: "No value",
    1: "Motion detector",
    2: "Presence detector",
    3: "True presence",
    4: "Not yet in use",
    5: "Not yet in use",
    6: "Not yet in use",
    7: "Not yet in use",
    8: "No value",
    9: "No value"
};


let variant = {
    0: "Wago 1 cable",
    1: "White",
    2: "Black",
    3: "Silver",
    4: "Wago 2 cables",
    5: "Wieland 1 cable",
    6: "Wieland 2 cables",
    7: "Not yet in use",
    8: "Remote control",
    9: "No value"
};

const extractProductInfo = (productNumber) => {

    const number = productNumber.split("-");
    const arr = number[1].split("");

    let seriesName = sensorSeries[arr[0]];
    let technologyName = technology[arr[1]];
    let mountingName = mounting[arr[2]];
    let outputName = output[arr[3]];
    let detectionName = detection[arr[4]];
    let variantName = variant[arr[5]];

    return {
        series: seriesName,
        technology: technologyName,
        mounting: mountingName,
        output: outputName,
        detection: detectionName,
        variant: variantName,
    }

}

export default { extractProductInfo, numberToProductNumberConverter, productNumberToSensor };