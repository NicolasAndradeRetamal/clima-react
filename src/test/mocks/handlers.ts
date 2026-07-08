import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FORECAST_BASE_URL, GEOCODING_BASE_URL } from '../../api/client';
import { emptySearchResponse, madridForecastResponse, madridSearchResponse } from './fixtures';

export const GEOCODING_SEARCH_URL = `${GEOCODING_BASE_URL}/search`;
export const FORECAST_URL = `${FORECAST_BASE_URL}/forecast`;

export const handlers = [
  http.get(GEOCODING_SEARCH_URL, ({ request }) => {
    const name = new URL(request.url).searchParams.get('name') ?? '';
    if (name.toLowerCase().startsWith('mad')) {
      return HttpResponse.json(madridSearchResponse);
    }
    return HttpResponse.json(emptySearchResponse);
  }),
  http.get(FORECAST_URL, () => HttpResponse.json(madridForecastResponse)),
];

export const server = setupServer(...handlers);
