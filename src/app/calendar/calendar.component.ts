import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import { findIndex, range, sortBy } from 'lodash-es';
import * as _lodash from 'lodash-es';

const moment = _rollupMoment || _moment;
declare var $: any; declare var jQuery: any;

export interface CalendarDate {
  mDate: _moment.Moment;
  selected?: boolean;
  today?: boolean;
}

interface Holiday {
  name: string;
  date: string;
  observed: string;
  public: boolean
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnChanges {

  @Input() info: any;

  constructor() {}

  currentDate = moment();
  dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  weeks: CalendarDate[][] = [];
  sortedDates: CalendarDate[] = [];
  startDate: Date;
  endDate: Date;
  holidays: Holiday[];

  @Input() selectedDates: CalendarDate[] = [];

  isToday(date: _moment.Moment): boolean {
    return moment().isSame(moment(date), 'day');
  }

  isSelected(date: _moment.Moment): boolean {
    return _lodash.findIndex(this.selectedDates, (selectedDate) => {
      return moment(date).isSame(selectedDate.mDate, 'day');
    }) > -1;
  }

  isSelectedMonth(date: _moment.Moment): boolean {
    return moment(date).isSame(this.currentDate, 'month');
  }

  prevMonth(): void {
    this.currentDate = moment(this.currentDate).subtract(1, 'months');
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = moment(this.currentDate).add(1, 'months');
    this.generateCalendar();
  }

  firstMonth(): void {
    this.currentDate = moment(this.currentDate).startOf('year');
    this.generateCalendar();
  }

  lastMonth(): void {
    this.currentDate = moment(this.currentDate).endOf('year');
    this.generateCalendar();
  }

  prevYear(): void {
    this.currentDate = moment(this.currentDate).subtract(1, 'year');
    this.generateCalendar();
  }

  nextYear(): void {
    this.currentDate = moment(this.currentDate).add(1, 'year');
    this.generateCalendar();
  } 

  generateCalendar(): void {
    const dates = this.fillDates(this.currentDate);
    const weeks: CalendarDate[][] = [];
    while (dates.length > 0) {
      weeks.push(dates.splice(0, 7));
    }
    this.weeks = weeks;
  }

  fillDates(currentMoment: _moment.Moment): CalendarDate[] {
    const firstOfMonth = moment(currentMoment).startOf('month').day();
    const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
    const start = firstDayOfGrid.date();
    return _lodash.range(start, start + 42)
            .map((date: number): CalendarDate => {
              const d = moment(firstDayOfGrid).date(date);
              return {
                today: this.isToday(d),
                selected: this.isSelected(d),
                mDate: d,
              };
            });
  } 

  checkDayType(day) {
    const dayNumber = day.mDate.weekday();
    if (dayNumber === 0 || dayNumber === 6) {
      return true;
    }
  }

  insideRange(day) {
    if (day.mDate.valueOf() >= this.startDate.getTime() &&
        day.mDate.valueOf() < this.endDate.getTime()) {
      return true;
    }
  }

  filterHolidays(holidays: Holiday[]){
    let holidaysInRange = holidays.filter(holiday => {
      let holidayFormatted:CalendarDate = {
        mDate: moment(holiday.date)
      };
      return this.insideRange(holidayFormatted);
    });
    return holidaysInRange;
  }

  isHoliday(day): boolean{
    let holidays = this.holidays.filter(item =>{ 
      let momentDate = moment(item.date);
      return momentDate.valueOf() === day.mDate.valueOf();
    })
    return holidays.length > 0;
  }

  ngOnInit() {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.info &&
        changes.info.currentValue) {

        let {date, days, country, api} = changes.info.currentValue;
        

        this.currentDate = moment(date);
        this.startDate = date;
        this.endDate = new Date(moment(date).add(days, 'day').format("YYYY-MM-DD"));
        this.holidays = this.filterHolidays(api.holidays);
        console.log(this.holidays);
    }
  }
}