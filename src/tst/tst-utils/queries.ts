export const GET_PREY_OF = `
  query(
    $name: String!
    $level: String
    $metrics: String
    $startYear: String
    $endYear: String
    $season: String
    $region: String
  ) {
    getPreyOf(
      predatorName: $name
      preyLevel: $level
      dietType: $metrics
      startYear: $startYear
      endYear: $endYear
      season: $season
      region: $region
    ) {
      items
      taxon
      wt_or_vol
      occurrence
      unspecified
    }
  }
`;
export const GET_PREDATOR_OF = `
  query(
    $name: String!
    $level: String
    $metrics: String
    $startYear: String
    $endYear: String
    $season: String
    $region: String
  ) {
    getPredatorOf(
      preyName: $name
      preyStage: $level
      dietType: $metrics
      startYear: $startYear
      endYear: $endYear
      season: $season
      region: $region
    ) {
      common_name
      family
      diet_type
      fraction_diet
      number_of_studies
    }
  }
`;

export const GET_AUTOCOMPLETE_PREY = `
  query($input: String!) {
    getAutocompletePrey(input: $input)
  }
`;
export const GET_AUTOCOMPLETE_PRED = `
  query($input: String!) {
    getAutocompletePred(input: $input)
  }
`;
export const RECORDS_PER_SEASON = `
  query(
    $name: String!
    $level: String
    $metrics: String
    $startYear: String
    $endYear: String
    $region: String
  ) {
    getRecordsPerSeason(
      predatorName: $name
      preyLevel: $level
      dietType: $metrics
      startYear: $startYear
      endYear: $endYear
      region: $region
    ) {
      x
      y
    }
  }
`;
export const RECORDS_PER_DIET_TYPE = `
  query(
    $name: String!
    $level: String
    $startYear: String
    $endYear: String
    $season: String
    $region: String
  ) {
    getRecordsPerDietType(
      predatorName: $name
      preyLevel: $level
      startYear: $startYear
      endYear: $endYear
      season: $season
      region: $region
    ) {
      x
      y
    }
  }
`;
export const RECORDS_PER_DECADE = `
  query(
    $name: String!
    $level: String
    $metrics: String
    $season: String
    $region: String
  ) {
    getRecordsPerDecade(
      predatorName: $name
      preyLevel: $level
      dietType: $metrics
      season: $season
      region: $region
    ) {
      x
      y
    }
  }
`;
export const GET_REGIONS_PRED = `
  query($name: String!) {
    getRegionsPred(name: $name)
  }
`;
export const GET_PREY_OF_SOURCES = `
  query($name: String!) {
    getPreyOfSources(predatorName: $name)
  }
`;
export const GET_NUM_RECORDS_AND_STUDIES = `
  query($name: String!) {
    getNumRecordsAndStudies(name: $name) {
      studies
      records
    }
  }
`;
export const GET_MAP_DATA = `
  query(
    $name: String!
    $metrics: String
    $startYear: String
    $endYear: String
    $seasons: String
    $region: String
  ) {
    getMapData(
      predatorName: $name
      dietType: $metrics
      startYear: $startYear
      endYear: $endYear
      season: $seasons
      region: $region
    ) {
      region
      count
    }
  }
`;