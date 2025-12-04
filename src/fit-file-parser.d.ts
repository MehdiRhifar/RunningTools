declare module 'fit-file-parser' {
  export interface FitParserOptions {
    force?: boolean
    speedUnit?: string
    lengthUnit?: string
    temperatureUnit?: string
    elapsedRecordField?: boolean
    mode?: string
  }

  export default class FitParser {
    constructor(options?: FitParserOptions)
    parse(
      content: ArrayBuffer,
      callback: (error: Error | null, data: any) => void
    ): void
  }
}
