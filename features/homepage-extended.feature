@ui
Feature: Homepage - extended checks

  Scenario: /index.html shows the backend message
    Given I open "/index.html"
    Then the "message" should have text "Hello from the backend!"

  Scenario: A loading state is shown while the API is slow
    Given the "message" endpoint is delayed by 2000 ms
    When I open the homepage
    Then the "message" should have text "Loading..."
    And the "message" should have text "Hello from the backend!"

  Scenario: The page shows whatever message the API returns
    Given the "message" endpoint responds with status 200 and body '{"message":"Custom message"}'
    When I open the homepage
    Then the "message" should have text "Custom message"

  Scenario: HTML in the message is shown as text, not executed
    Given the "message" endpoint responds with status 200 and body '{"message":"<img src=x onerror=alert(1)>"}'
    When I open the homepage
    Then the "message" should have text "<img src=x onerror=alert(1)>"
    And the page should not contain the element "img"

  Scenario: The page shows an error when the API returns invalid JSON
    Given the "message" endpoint responds with status 200 and body 'not json'
    When I open the homepage
    Then the "message" should have text "Could not reach the backend."

  Scenario: The page shows an error when the API response has no message
    Given the "message" endpoint responds with status 200 and body '{"text":"wrong field"}'
    When I open the homepage
    Then the "message" should have text "Could not reach the backend."

  Scenario: The page loads cleanly with a single API call
    Given I open the homepage
    Then the "message" should have text "Hello from the backend!"
    And there should be no console errors
    And the "message" endpoint should have been requested 1 time
