@ui
Feature: Homepage
  As a visitor
  I want to see the message from the backend on the homepage

  Scenario: Homepage shows the backend message
    Given I open the homepage
    Then the page title should be "tiny-app"
    And the "heading" should have text "tiny-app"
    And the "message" should have text "Hello from the backend!"

  Scenario: Homepage still loads with a query string
    Given I open the homepage with query "?ref=newsletter"
    Then the "message" should have text "Hello from the backend!"

  Scenario: Homepage shows an error when the backend is unreachable
    Given the "message" endpoint is unreachable
    When I open the homepage
    Then the "message" should have text "Could not reach the backend."

  Scenario: Homepage shows an error when the backend returns a server error
    Given the "message" endpoint responds with status 500 and body '{"error":"boom"}'
    When I open the homepage
    Then the "message" should have text "Could not reach the backend."
