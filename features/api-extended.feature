Feature: Message API - extended checks

  Scenario: /index.html serves the homepage
    When I send a GET request to "/index.html"
    Then the response status should be 200
    And the response header "Content-Type" should contain "text/html"

  Scenario: The API response contains only the message field
    When I send a GET request to the "message" endpoint
    Then the response JSON should have exactly the keys "message"

  Scenario: HEAD on the homepage returns headers without a body
    When I send a HEAD request to "/"
    Then the response status should be 200
    And the response body should be empty

  Scenario: POST to the homepage is rejected
    When I send a POST request to "/"
    Then the response status should be 405
    And the response header "Allow" should contain "GET"

  Scenario Outline: Other unsupported methods on the API are rejected
    When I send a <method> request to the "message" endpoint
    Then the response status should be 405

    Examples:
      | method  |
      | PATCH   |
      | OPTIONS |

  Scenario: POST to an unknown route returns 404, not 405
    When I send a POST request to "/does-not-exist"
    Then the response status should be 404

  Scenario Outline: Internal files and wrong paths are not exposed
    When I send a GET request to "<path>"
    Then the response status should be 404
    And the response body should not contain "require("

    Examples:
      | path              |
      | /server.js        |
      | /package.json     |
      | /%2e%2e/server.js |
      | /API/MESSAGE      |

  Scenario: The API handles concurrent requests
    When I send 20 concurrent GET requests to the "message" endpoint
    Then all responses should have status 200

  Scenario: A malformed request URL does not crash the server
    When I send the raw request line "GET http://[ HTTP/1.1"
    Then the raw response status should be 400
    And the server should still respond to the "message" endpoint
