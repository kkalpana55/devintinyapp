Feature: Message API
  As a frontend developer
  I want a stable /api/message endpoint
  So that the homepage can show the backend message

  Scenario: Get the message
    When I send a GET request to the "message" endpoint
    Then the response status should be 200
    And the response header "Content-Type" should contain "application/json"
    And the response JSON field "message" should be "Hello from the backend!"

  Scenario: Query strings do not break routing
    When I send a GET request to "/api/message?cacheBust=123"
    Then the response status should be 200
    And the response JSON field "message" should be "Hello from the backend!"

  Scenario: HEAD request returns headers without a body
    When I send a HEAD request to the "message" endpoint
    Then the response status should be 200
    And the response body should be empty

  Scenario Outline: Unsupported methods are rejected
    When I send a <method> request to the "message" endpoint
    Then the response status should be 405
    And the response header "Allow" should contain "GET"

    Examples:
      | method |
      | POST   |
      | PUT    |
      | DELETE |

  Scenario: Unknown routes return a plain-text 404
    When I send a GET request to "/does-not-exist"
    Then the response status should be 404
    And the response header "Content-Type" should contain "text/plain"
