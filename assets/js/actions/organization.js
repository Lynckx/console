import { push } from 'connected-react-router';
import sanitizeHtml from 'sanitize-html'
import * as rest from '../util/rest';
import { getOrganizationId, getOrganizationName } from '../util/jwt';
import { logIn } from './auth'

export const FETCH_ORGANIZATIONS = 'FETCH_ORGANIZATIONS'
export const SWITCHED_ORGANIZATION = 'SWITCHED_ORGANIZATION'

export const createOrganization = (name, noOtherOrg = false) => {
  return (dispatch) => {
    rest.post('/api/organizations', {
        organization: {
          name: sanitizeHtml(name)
        },
      })
      .then(response => {
        if (noOtherOrg) {
          dispatch(logIn(response.data.jwt))
          window.location.reload(true)
        }
      })
  }
}

export const switchOrganization = (id) => {
  return (dispatch) => {
    rest.post(`/api/organizations/${id}/switch`)
      .then(response => {
        dispatch(switchedOrganization(response.data.jwt))
        window.location.reload(true)
      })
  }
}

export const deleteOrganization = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/organizations/${id}`)
      .then(response => {})
  }
}

export const switchedOrganization = (apikey) => {
  return {
    type: SWITCHED_ORGANIZATION,
    apikey,
    currentOrganizationId: getOrganizationId(apikey),
    currentOrganizationName: getOrganizationName(apikey)
  }
}
