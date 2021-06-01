export default interface Config {
  maxHistory?: boolean;
  startingPassage?: string;
  layoutHtml?: string;
  globals?: string[];
  twineyTemp?: boolean;

  scripts?: {
    var: string,
    href: string,
    integrity?: string
  }[];

  styles?: {
    href: string,
    integrity?: string
  };
}
