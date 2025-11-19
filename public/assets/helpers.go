package analytics

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

// GetJSON retrieves the JSON response from the provided HTTP request.
func GetJSON(req *http.Request) (*http.Response, error) {
	resp, err := http.DefaultClient.Do(req)
	if err!= nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode!= http.StatusOK {
		return nil, &httpError{resp.StatusCode}
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err!= nil {
		return nil, err
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err!= nil {
		return nil, err
	}

	return resp, nil
}

// NewHTTPError returns a new HTTPError with the provided status code.
func NewHTTPError(statusCode int) *httpError {
	return &httpError{statusCode}
}

type httpError struct {
	statusCode int
}

func (e *httpError) Error() string {
	return http.StatusText(e.statusCode)
}

// Timer returns a new timer that can be used to measure the duration of a function.
func Timer() time.Timer {
	return time.NewTimer(0)
}