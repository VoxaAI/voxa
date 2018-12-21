/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { EventsBuilder } from "../ProactiveEvents";

/**
 * Sports Events Builder class reference
 */
export class SportsEventBuilder extends EventsBuilder {
  public sportsEvent: any = {};
  public update: any = {};

  constructor() {
    super("AMAZON.SportsEvent.Updated");
  }

  public setAwayTeamStatistic(teamName: string, score: number): SportsEventBuilder {
    return this.setTeamStatistic("awayTeamStatistic", teamName, score);
  }

  public setHomeTeamStatistic(teamName: string, score: number): SportsEventBuilder {
    return this.setTeamStatistic("homeTeamStatistic", teamName, score);
  }

  public setUpdate(teamName: string, scoreEarned: number): SportsEventBuilder {
    this.update = { scoreEarned, teamName };

    return this;
  }

  public getPayload(): any {
    this.sportsEvent.eventLeague = {
      name: "localizedattribute:eventLeagueName",
    };

    return {
      sportsEvent: this.sportsEvent,
      update: this.update,
    };
  }

  private setTeamStatistic(statisticType: string, teamName: string, score: number): SportsEventBuilder {
    this.sportsEvent[statisticType] = {
      score,
      team: { name: teamName },
    };

    return this;
  }
}
