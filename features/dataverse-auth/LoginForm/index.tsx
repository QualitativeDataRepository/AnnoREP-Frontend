import React, { ChangeEvent, FC, FormEventHandler } from "react"

import { Button, Form, TextInput, Link } from "carbon-components-react"

export interface LoginFormProps {
  /**The dataverse server url */
  serverUrl: string
  /**Is dataverse server url invalid? */
  serverUrlIsInvalid: boolean
  /**The error message for the dataverse server url input */
  serverUrlInvalidText: string
  /**Callback to handle api base url input changes */
  handleServerUrlChange(value: string): void
  /**The dataverse api token */
  apiToken: string
  /**Is the dataverse api token valid? */
  apiTokenIsInvalid: boolean
  /**The error mesage for the dataverse api token input */
  apiTokenInvalidText: string
  /**Callback to handle the dataverse api token input changes */
  handleApiTokenChange(value: string): void
  /**Callback to handle login */
  handleLogin(): void
}

/**Dataverse Login Form */
const LoginForm: FC<LoginFormProps> = ({
  serverUrl,
  serverUrlIsInvalid,
  serverUrlInvalidText,
  handleServerUrlChange,
  apiToken,
  apiTokenIsInvalid,
  apiTokenInvalidText,
  handleApiTokenChange,
  handleLogin,
}: LoginFormProps) => {
  const onServerUrlChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleServerUrlChange(event.target.value)
  const onApiTokenChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleApiTokenChange(event.target.value)
  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    handleLogin()
  }

  return (
    <main className="ar--form-container">
      <Form onSubmit={onSubmit}>
        <h1 className="ar--form-title">Log in to a Dataverse</h1>
        <p className="ar--form-desc">
          Give AnnoREP permissions to access your Dataverse resources by providing the Dataverse
          Server Uniform Resource Locator (<abbr>URL</abbr>) and your Application programming
          interface (<abbr>API</abbr>) token. Instructions for getting an <abbr>API</abbr> token are
          described in the{" "}
          <Link
            size="lg"
            href="https://guides.dataverse.org/en/latest/user/account.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Account Creation + Management
          </Link>{" "}
          section of the User Guide.
        </p>
        <div className="ar--form-item">
          <TextInput
            id="dataverse-server-url"
            labelText={
              <div>
                Dataverse Server <abbr>URL</abbr>
              </div>
            }
            invalid={serverUrlIsInvalid}
            invalidText={serverUrlInvalidText}
            placeholder="Ex. https://demo.dataverse.org"
            required={true}
            aria-required={true}
            size="xl"
            type="url"
            value={serverUrl}
            onChange={onServerUrlChange}
          />
        </div>
        <div className="ar--form-item">
          <TextInput
            id="dataverse-api-token"
            labelText={
              <div>
                Dataverse <abbr>API</abbr> Token
              </div>
            }
            invalid={apiTokenIsInvalid}
            invalidText={apiTokenInvalidText}
            required={true}
            aria-required={true}
            placeholder="Enter your API token"
            size="xl"
            type="text"
            value={apiToken}
            onChange={onApiTokenChange}
          />
        </div>
        <Button className="ar--form-submit-btn" type="submit">
          Log in
        </Button>
      </Form>
    </main>
  )
}

export default LoginForm
