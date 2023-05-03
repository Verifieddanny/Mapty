'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const iconContainer = document.querySelectorAll('.icons');
const errorMessage = document.querySelector('.errorMessage');
const successMessage = document.querySelector('.success');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  count = 0;
  constructor(cordinates, distance, duration) {
    this.cordinates = cordinates;
    this.distance = distance;
    this.duration = duration;
  }

  _getDIscription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.decription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  _click() {
    this.count++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(cordinates, distance, duration, cadence) {
    super(cordinates, distance, duration);
    this.cadence = cadence;
    // this.type = 'running';
    this._calcPace();
    this._getDIscription();
  }

  _calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(cordinates, distance, duration, elevationGain) {
    super(cordinates, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = 'cycling';
    this._calcSpeed();
    this._getDIscription();
  }

  _calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([14, 4], 30, 67, 900);
// const cycle1 = new Cycling([14, 4], 30, 67, 900);

// console.log(run1, cycle1);
//////////////////////////////////////////////////////////
//APPLICATION
class App {
  #map;
  #mapEvent;
  #workOutArr = [];
  #mapZoom = 13;
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkOut.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._setViewMap.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get you loaction');
        }
      );
  }

  _loadMap(position) {
    console.log(position);

    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const cordinates = [latitude, longitude];

    this.#map = L.map('map').setView(cordinates, this.#mapZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    this.#workOutArr.forEach(work => this._getPopUp(work));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //prettier-ignore
    inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
    form.style.display = `none`;
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = `grid`;
    }, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkOut(e) {
    e.preventDefault();
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    const validateNumber = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const positiveNumber = (...inputs) => inputs.every(inp => inp > 0);

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validateNumber(distance, duration, cadence) ||
        !positiveNumber(distance, duration, cadence)
      ) {
        errorMessage.classList.remove('hide');
        setTimeout(() => {
          errorMessage.classList.add('hide');
        }, 1500);
        return;
      } else {
        workout = new Running([lat, lng], distance, duration, cadence);
        successMessage.classList.remove('hide');
        setTimeout(() => {
          successMessage.classList.add('hide');
        }, 1500);
      }
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validateNumber(distance, duration, elevation) ||
        !positiveNumber(distance, duration)
      ) {
        errorMessage.classList.remove('hide');
        setTimeout(() => {
          errorMessage.classList.add('hide');
        }, 1500);
        return alert;
      } else {
        workout = new Cycling([lat, lng], distance, duration, elevation);
        successMessage.classList.remove('hide');
        setTimeout(() => {
          successMessage.classList.add('hide');
        }, 1500);
      }
    }
    this.#workOutArr.push(workout);
    this._getPopUp(workout);
    this._renderActivities(workout);
    this._hideForm();
    this._setLocalStorage();
  }

  _getPopUp(workout) {
    L.marker(workout.cordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.decription}`
      )
      .openPopup();
  }
  _renderActivities(workout) {
    //prettier-ignore
    let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
                 
                      <h2 class="workout__title">${workout.decription}</h2>

                  
                  <div class="workout__details">
                  <span class="workout__icon">${
                    workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
                  }</span>
                  <span class="workout__value">${workout.distance}</span>
                  <span class="workout__unit">km</span>
                 </div>
                 <div class="workout__details">
                   <span class="workout__icon">⏱</span>
                   <span class="workout__value">${workout.duration}</span>
                   <span class="workout__unit">min</span>
                 </div>`;
    if (workout.type === 'running') {
      html += `
                  <div class="workout__details">
                       <span class="workout__icon">⚡️</span>
                       <span class="workout__value">${workout.pace.toFixed(
                         1
                       )}</span>
                       <span class="workout__unit">min/km</span>
                     </div>
                     <div class="workout__details">
                       <span class="workout__icon">🦶🏼</span>
                       <span class="workout__value">${workout.cadence}</span>
                       <span class="workout__unit">spm</span>
                     </div>
                   </li>`;
    }

    if (workout.type === 'cycling') {
      html += `
                  <div class="workout__details">
                       <span class="workout__icon">⚡️</span>
                       <span class="workout__value">${workout.speed.toFixed(
                         1
                       )}</span>
                       <span class="workout__unit">min/km</span>
                     </div>
                     <div class="workout__details">
                       <span class="workout__icon">🦶🏼</span>
                       <span class="workout__value">${
                         workout.elevationGain
                       }</span>
                       <span class="workout__unit">spm</span>
                     </div>
                   </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _setViewMap(e) {
    const workOutEl = e.target.closest('.workout');

    if (!workOutEl) return;

    const workout = this.#workOutArr.find(
      work => work.id === workOutEl.dataset.id
    );

    this.#map.setView(workout.cordinates, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workOutArr));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workOutArr = data;

    this.#workOutArr.forEach(works => this._renderActivities(works));
  }

  _resetStorage() {
    localStorage.removeItem('workouts');
    location.reload();
  }

  _removeWorkOut() {
    //if clicked
    //pop workout from the #workoutArr
  }

  _editWorkOut() {
    //if clicked
    //remove the hidden class from the form
    //set values to the original values
    //remove the value
    //
  }
}

const app = new App();

// const del = document.querySelectorAll('.delete');

// del.addEventListener('click', function () {
//   const head = del.parentNode;
//   const ul = head.parentNode;
//   ul.removeChild(head);
// });
