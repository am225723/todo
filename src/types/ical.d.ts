declare module 'ical.js' {
  export interface Component {
    jCal: any[][];
    name: string;
    getFirstPropertyValue(name: string): string;
    getAllProperties(name: string): string[];
    hasProperty(name: string): boolean;
  }

  export interface Event {
    component: Component;
    startDate: Date;
    endDate: Date;
    summary: string;
    description: string;
    location: string;
  }

  export const ICAL: {
    Component: {
      fromString(str: string): Component;
      new(data: any): Component;
    };
    Event: {
      fromString(str: string): Event;
    };
    parse(str: string): any;
  };
}